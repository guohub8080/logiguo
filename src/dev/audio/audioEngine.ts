/**
 * SpessaSynth 音频引擎 —— Jotai 单例管理
 *
 * 管理 AudioContext + WorkletSynthesizer 的生命周期。
 * synth/ctx 引用存在 Jotai store（不受 HMR 模块重置影响）。
 */
import { atom, getDefaultStore } from "jotai"
import { WorkletSynthesizer, Sequencer } from "spessasynth_lib"
import type { BasicSynthesizer } from "spessasynth_lib"

// sf2/sf3 音源路径（public/soundfont/ 下，构建后位于站点根/soundfont/）
const SOUNDFONT_URL = "./soundfont/GeneralUserGS-trimmed.sf3"
// worklet 处理器路径
const WORKLET_URL = "./soundfont/spessasynth_processor.min.js"

// 引擎状态
export type EngineStatus = "uninitialized" | "loading" | "ready" | "error"

export const engineStatusAtom = atom<EngineStatus>("uninitialized")
export const engineErrorAtom = atom<string | null>(null)
/** 当前已加载的音源 URL */
export const currentSoundFontAtom = atom<string | null>(null)

// synth/ctx 引用存在 atom（避免 HMR 重置模块变量导致实例丢失）
const refAtom = atom<{ synth: WorkletSynthesizer | null; ctx: AudioContext | null; seq: Sequencer | null }>({ synth: null, ctx: null, seq: null })

/** 获取 synth（可能为 null） */
export function getSynth(): WorkletSynthesizer | null {
	return getDefaultStore().get(refAtom).synth
}

/** 获取所有可用音色列表 */
export function getPresetList() {
	return getSynth()?.presetList ?? []
}

/** 当前选中的音色（atom 持久化，React 和非 React 代码共享同一状态） */
export interface SelectedPreset {
	program: number
	bankMSB: number
	bankLSB: number
	isDrum: boolean
}
export const selectedPresetAtom = atom<SelectedPreset>({ program: 0, bankMSB: 0, bankLSB: 0, isDrum: false })

/**
 * 切换通道的音色
 * 鼓组（isDrum=true）：channel 9 默认就是鼓组通道（SpessaSynth 自动 setDrums），
 *   只需 programChange 选鼓组 program，不要动 bank（否则会破坏 drum 标记）
 * 普通乐器：设 bank + program
 */
export function changeProgram(channel: number, program: number, bankMSB = 0, bankLSB = 0, isDrum = false): void {
	const synth = getSynth()
	if (!synth) return
	// 记录当前选择到 atom
	getDefaultStore().set(selectedPresetAtom, { program, bankMSB, bankLSB, isDrum })

	if (isDrum) {
		// 鼓组：channel 9 已经自动是 drums，只需选 program（Standard Kit = program 0）
		synth.programChange(channel, program)
	} else {
		// 普通乐器：先设 bank 再 program
		synth.controllerChange(channel, 0, bankMSB)
		synth.controllerChange(channel, 32, bankLSB)
		synth.programChange(channel, program)
	}
}

/** 获取 AudioContext（可能为 null） */
export function getAudioContext(): AudioContext | null {
	return getDefaultStore().get(refAtom).ctx
}

/**
 * 初始化音频引擎（必须在用户手势回调里调用）
 * @param soundFontUrl 可选，指定音源 URL；不传则用默认 SOUNDFONT_URL
 * 幂等：已就绪则直接返回（但不会切换音源，如需切换用 loadSoundFont）。
 */
export async function initAudioEngine(soundFontUrl?: string): Promise<WorkletSynthesizer> {
	const store = getDefaultStore()

	// 已就绪则直接返回
	const existing = store.get(refAtom)
	if (existing.synth && store.get(engineStatusAtom) === "ready") {
		return existing.synth
	}

	store.set(engineStatusAtom, "loading")
	store.set(engineErrorAtom, null)

	try {
		const ctx = new AudioContext()
		await ctx.resume()

		await ctx.audioWorklet.addModule(WORKLET_URL)

		const synth = new WorkletSynthesizer(ctx)
		synth.connect(ctx.destination)

		const url = soundFontUrl ?? SOUNDFONT_URL
		const response = await fetch(url)
		if (!response.ok) throw new Error(`音源加载失败: ${response.status}`)
		const sfBuffer = await response.arrayBuffer()
		await synth.soundBankManager.addSoundBank(sfBuffer, "main")

		await synth.isReady

		store.set(currentSoundFontAtom, url)
		store.set(refAtom, { synth, ctx, seq: new Sequencer(synth) })
		store.set(engineStatusAtom, "ready")
		return synth
	} catch (e) {
		const msg = e instanceof Error ? e.message : String(e)
		store.set(engineStatusAtom, "error")
		store.set(engineErrorAtom, msg)
		console.error("[audio] 初始化失败:", e)
		throw e
	}
}

/**
 * 加载（或切换）音源。引擎已初始化时会切换到新音源。
 * @param url 音源 URL，不传则用默认 SOUNDFONT_URL
 */
export async function loadSoundFont(url?: string): Promise<void> {
	const store = getDefaultStore()
	const targetUrl = url ?? SOUNDFONT_URL
	// 如果已经加载了同一个音源，跳过
	if (store.get(currentSoundFontAtom) === targetUrl) return

	const synth = getSynth()
	if (!synth) return

	store.set(engineStatusAtom, "loading")
	const response = await fetch(targetUrl)
	if (!response.ok) throw new Error(`音源加载失败: ${response.status}`)
	const sfBuffer = await response.arrayBuffer()
	await synth.soundBankManager.addSoundBank(sfBuffer, "main")
	await synth.isReady
	store.set(currentSoundFontAtom, targetUrl)
	store.set(engineStatusAtom, "ready")
}

/**
 * 播放一个 MIDI 音符
 * @param velocity 力度 0-127（MIDI 标准，不是 0-1）
 */
export function playNote(channel: number, note: number, velocity = 100, duration?: number): void {
	const synth = getSynth()
	if (!synth) {
		console.warn("[audioEngine] 引擎未初始化，请先调用 initAudioEngine()")
		return
	}
	synth.noteOn(channel, note, velocity)
	if (duration !== undefined) {
		setTimeout(() => synth.noteOff(channel, note), duration * 1000)
	}
}

/** 停止某个音符 */
export function stopNote(channel: number, note: number): void {
	getSynth()?.noteOff(channel, note)
}

/** 停止所有正在响的音符 */
export function stopAllNotes(): void {
	getSynth()?.stopAll()
}

// ============================================================
// MIDI Sequencer（序列播放控制）
// ============================================================

/** 获取 Sequencer 实例 */
export function getSequencer(): Sequencer | null {
	return getDefaultStore().get(refAtom).seq
}

/** 加载并播放 MIDI 文件（ArrayBuffer） */
export async function loadAndPlayMidi(midiBuffer: ArrayBuffer): Promise<void> {
	const seq = getSequencer()
	if (!seq) throw new Error("引擎未初始化")
	seq.loadNewSongList([{ binary: midiBuffer }])
	// loadNewSongList 会 reset channel。
	// 鼓组（channel 9）reset 后会自动 setDrums(true) 加载鼓组 preset，无需手动设。
	// 只需恢复乐器的音色到 channel 0。
	const { program, bankMSB, bankLSB, isDrum } = getDefaultStore().get(selectedPresetAtom)
	if (!isDrum) {
		changeProgram(0, program, bankMSB, bankLSB, false)
	}
	seq.play()
}

/** 播放 */
export function seqPlay(): void {
	getSequencer()?.play()
}

/** 暂停 */
export function seqPause(): void {
	getSequencer()?.pause()
}

/** 停止（暂停 + 回到起点） */
export function seqStop(): void {
	const seq = getSequencer()
	if (!seq) return
	seq.pause()
	seq.currentTime = 0
}

/** 跳转到指定时间（秒） */
export function seqSeek(seconds: number): void {
	const seq = getSequencer()
	if (!seq) return
	seq.currentTime = seconds
}

/** 设置循环次数（-1 = 无限循环） */
export function seqSetLoop(count: number): void {
	const seq = getSequencer()
	if (!seq) return
	seq.loopCount = count
}

/** 设置播放速率（1 = 正常，1.5 = 1.5 倍速） */
export function seqSetRate(rate: number): void {
	const seq = getSequencer()
	if (!seq) return
	seq.playbackRate = rate
}

/** 获取当前播放时间（秒） */
export function seqGetTime(): number {
	return getSequencer()?.currentTime ?? 0
}

/** 获取总时长（秒） */
export function seqGetDuration(): number {
	return getSequencer()?.duration ?? 0
}

/** 是否暂停中 */
export function seqIsPaused(): boolean {
	return getSequencer()?.paused ?? true
}

/** 销毁引擎 */
export function destroyAudioEngine(): void {
	const { synth, ctx, seq } = getDefaultStore().get(refAtom)
	if (seq) seq.pause()
	if (synth) synth.destroy()
	if (ctx) ctx.close()
	getDefaultStore().set(refAtom, { synth: null, ctx: null, seq: null })
	getDefaultStore().set(engineStatusAtom, "uninitialized")
}

export type { BasicSynthesizer }
