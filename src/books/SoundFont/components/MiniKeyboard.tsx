/** @jsxImportSource react */
/** @jsxImportSource @emotion/react */
/**
 * 音色试听面板 —— 所有音色展开，每个音色下带多个八度的 OctavePiano 钢琴键盘
 */
import React, { useState, useEffect, useRef } from "react"
import { useAtomValue } from "jotai"
import {
	initAudioEngine, loadSoundFont, playNote, stopNote,
	engineStatusAtom, currentSoundFontAtom, getPresetList, changeProgram,
} from "@dev/audio/audioEngine.ts"
import OctavePiano, { type KeyConfig, type OctavePianoConfig } from "@music-comps/OctavePiano"
import { defaultPianoConfig } from "@music-comps/OctavePiano"

// 音域：C3(48) 到 C6(84)，3 个八度 + 1 音
const START_OCTAVE = 3 // 从 C3 开始
const NUM_OCTAVES = 3  // 3 个八度
const BASE_MIDI = 12 * (START_OCTAVE + 1) // C3 = 48

interface PresetInfo {
	name: string; program: number; bankMSB: number; bankLSB: number; isDrum: boolean
}

interface Props {
	/** 音源 URL */
	soundFontUrl?: string
	/** 可选：只显示这些音色（按名字过滤），不传则显示全部 */
	filterNames?: string[]
}

// 全局鼠标按键状态（所有 PresetRow 共享）
let globalMouseDown = false
if (typeof window !== "undefined") {
	window.addEventListener("mousedown", () => { globalMouseDown = true })
	window.addEventListener("mouseup", () => { globalMouseDown = false })
}

// 紧凑的钢琴配置
const miniConfig: OctavePianoConfig = {
	...defaultPianoConfig,
	whiteKeyWidth: 28,
	whiteKeyHeight: 72,
	whiteKeyBorderWidth: 1,
	blackKeyBorderWidth: 1,
}

// 单个音色行：名称 + 多个八度的钢琴键盘
function PresetRow({ preset }: { preset: PresetInfo }) {
	const [activeNote, setActiveNote] = useState<number | null>(null)
	const activeNoteRef = useRef<number | null>(null)
	const programSetRef = useRef(false)  // 避免每次按键都重设音色
	const channel = preset.isDrum ? 9 : 0

	const playMidi = (midi: number) => {
		// 先停上一个音
		if (activeNoteRef.current !== null) {
			stopNote(channel, activeNoteRef.current)
		}
		// 只在首次按键时设音色（同音色不需要重复设）
		if (!programSetRef.current) {
			changeProgram(channel, preset.program, preset.bankMSB, preset.bankLSB, preset.isDrum)
			programSetRef.current = true
		}
		playNote(channel, midi, 100)
		activeNoteRef.current = midi
		setActiveNote(midi)
	}

	const stopActive = () => {
		if (activeNoteRef.current !== null) {
			stopNote(channel, activeNoteRef.current)
			activeNoteRef.current = null
			setActiveNote(null)
		}
	}

	// 全局 mouseup/touchend 停音（用 ref 读最新值，不依赖 activeNote）
	useEffect(() => {
		const onUp = () => stopActive()
		window.addEventListener("mouseup", onUp)
		window.addEventListener("touchend", onUp)
		return () => {
			window.removeEventListener("mouseup", onUp)
			window.removeEventListener("touchend", onUp)
		}
	}, [channel])

	// 渲染 NUM_OCTAVES 个八度，横向排列
	return (
		<div className="py-2 border-b border-border/30 last:border-0">
			<div className="flex items-center gap-2 mb-1.5">
				<span className="text-xs font-medium text-foreground">{preset.name}</span>
				<span className="text-[10px] text-muted-foreground">
					{preset.bankMSB}:{preset.program}
				</span>
				{preset.isDrum && <span className="text-[10px] text-orange-500">鼓组</span>}
			</div>
			<div className="flex overflow-x-auto pb-1" style={{ gap: 0 }}>
				{Array.from({ length: NUM_OCTAVES }, (_, octIdx) => {
					const octaveBase = BASE_MIDI + octIdx * 12
					// 为这个八度生成 12 个键的配置
					const keys: KeyConfig[] = Array.from({ length: 12 }, (_, i) => {
						const midi = octaveBase + i
						const isActive = activeNote === midi
						return {
							bgColor: isActive ? "#E13455" : undefined,
							onMouseDown: () => playMidi(midi),
							onMouseEnter: () => { if (globalMouseDown) playMidi(midi) },
						}
					})
					return (
						<div key={octIdx} className="shrink-0">
							<OctavePiano config={miniConfig} keys={keys} ml={octIdx > 0 ? -2 : 0} />
						</div>
					)
				})}
			</div>
		</div>
	)
}

export default function MiniKeyboard({ soundFontUrl, filterNames }: Props) {
	const status = useAtomValue(engineStatusAtom)
	const currentSf = useAtomValue(currentSoundFontAtom)
	const [presets, setPresets] = useState<PresetInfo[]>([])
	// 判断当前音源是否已匹配
	const sfReady = currentSf === (soundFontUrl ?? "./soundfont/GeneralUserGS-trimmed.sf3")

	// 自动初始化
	useEffect(() => {
		if (status !== "uninitialized") return
		const init = async () => {
			if (status === "uninitialized") {
				await initAudioEngine(soundFontUrl)
			}
		}
		window.addEventListener("pointerdown", init, { once: true })
		window.addEventListener("keydown", init, { once: true })
		return () => {
			window.removeEventListener("pointerdown", init)
			window.removeEventListener("keydown", init)
		}
	}, [status, soundFontUrl])

	// 引擎就绪后：切换到本组件指定的音源 + 加载音色列表
	useEffect(() => {
		if (status !== "ready") return
		const loadPresets = () => {
			const list = getPresetList()
			const filtered = filterNames
				? list.filter(p => filterNames.some(n => p.name.toLowerCase().includes(n.toLowerCase())))
				: list.filter(p => p.bankMSB === 0)
			setPresets(filtered.map(p => ({ name: p.name, program: p.program, bankMSB: p.bankMSB, bankLSB: p.bankLSB, isDrum: p.isDrum })))
		}
		if (soundFontUrl) {
			// 切换音源，加载完再读 preset 列表
			loadSoundFont(soundFontUrl).then(loadPresets).catch(console.error)
		} else {
			loadPresets()
		}
	}, [status, soundFontUrl, filterNames])

	const ready = status === "ready"

	return (
		<div className="my-4">
			{!ready ? (
				<p className="text-sm text-muted-foreground text-center py-4">
					{status === "loading" ? "加载音频引擎中..." : "点击页面任意位置启动试听器"}
				</p>
			) : presets.length === 0 ? (
				<p className="text-sm text-muted-foreground text-center py-4">暂无音色</p>
			) : (
				<div className="rounded-xl border border-border/40 bg-card/40 overflow-hidden px-3">
					{presets.map((p, i) => (
						<PresetRow key={i} preset={p} />
					))}
				</div>
			)}
		</div>
	)
}
