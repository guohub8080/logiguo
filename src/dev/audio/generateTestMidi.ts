/**
 * 生成一个简单的测试 MIDI 文件（C 大调音阶 + 简单和弦）
 * 返回 ArrayBuffer，可直接传给 loadAndPlayMidi
 * @param channel MIDI 通道（0-15），鼓组用 9
 * @param mode 调式，默认 "major"（自然大调），可选 "dorian"（多利亚调式）
 */
export function generateTestMidi(channel = 0, mode: "major" | "dorian" = "major"): ArrayBuffer {
	// MIDI 格式：头部 + 音轨
	// 格式0，1轨，分辨率 480 ticks per quarter
	const header = [
		0x4D, 0x54, 0x68, 0x64, // "MThd"
		0x00, 0x00, 0x00, 0x06, // 长度 6
		0x00, 0x00,             // 格式 0
		0x00, 0x01,             // 1 轨
		0x01, 0xE0,             // 分辨率 480
	]

	// 音符事件：[note, startTime(ticks), duration(ticks)]
	const tick = 480 // 四分音符
	const notes: [number, number, number][] = []
	let time = 0

	// 根据调式选音阶（都以 C 为根音）
	// C 大调（自然大调）：C D E F G A B  → 全全半全全全半
	// C Dorian（多利亚调式）：C D Eb F G A Bb → 全半全全全半全（大调降 3 降 7）
	const scales = {
		major:  { up: [60, 62, 64, 65, 67, 69, 71, 72], chord: [60, 64, 67], down: [72, 71, 69, 67, 65, 64, 62, 60] },
		dorian: { up: [60, 62, 63, 65, 67, 69, 70, 72], chord: [60, 63, 67], down: [72, 70, 69, 67, 65, 63, 62, 60] },
	}
	const scale = scales[mode]

	// 音阶上行
	for (const note of scale.up) {
		notes.push([note, time, tick])
		time += tick
	}

	// 主和弦（2 拍）
	time += tick // 停一拍
	for (const note of scale.chord) {
		notes.push([note, time, tick * 2])
	}
	time += tick * 2

	// 音阶下行
	for (const note of scale.down) {
		notes.push([note, time, tick])
		time += tick
	}

	// 按 startTime 排序
	notes.sort((a, b) => a[1] - b[1])

	// 构建 MIDI 事件流（delta time 编码）
	const events: number[] = []
	let lastTime = 0

	// Tempo meta event（120 BPM）
	events.push(0x00, 0xFF, 0x51, 0x03, 0x07, 0xA1, 0x20) // 500000us = 120BPM

	// 不写 Program Change —— 让 MIDI 使用当前 channel 的音色（用户选的）

	// 为每个音符生成 noteOn + noteOff
	// channel 编码在状态字节低 4 位：noteOn=0x9N, noteOff=0x8N
	const noteOnStatus = 0x90 | (channel & 0x0F)
	const noteOffStatus = 0x80 | (channel & 0x0F)
	const noteEvents: { tick: number; data: number[] }[] = []
	// 鼓组：note 号 = 打击乐器类型，用节奏型而非音阶
	const drumPattern: [number, number, number][] = [
		[36, 0, 240],       // 底鼓
		[42, 240, 240],     // 踩镲
		[38, 480, 240],     // 军鼓
		[42, 720, 240],     // 踩镲
		[36, 960, 240],     // 底鼓
		[42, 1200, 240],    // 踩镲
		[38, 1440, 240],    // 军鼓
		[46, 1680, 480],    // 开镲
		[49, 1920, 480],    // 镲片
		[36, 2160, 240],    // 底鼓
		[38, 2400, 240],    // 军鼓
		[42, 2640, 480],    // 踩镲
	]
	const notesToUse = channel === 9 ? drumPattern : notes
	for (const [note, start, dur] of notesToUse) {
		noteEvents.push({ tick: start, data: [noteOnStatus, note, 100] })
		noteEvents.push({ tick: start + dur, data: [noteOffStatus, note, 0] })
	}
	noteEvents.sort((a, b) => a.tick - b.tick)

	for (const ev of noteEvents) {
		const delta = ev.tick - lastTime
		lastTime = ev.tick
		// Variable length encoding
		if (delta < 128) {
			events.push(delta)
		} else if (delta < 16384) {
			events.push(0x80 | (delta >> 7), delta & 0x7F)
		} else {
			events.push(0x80 | (delta >> 14), 0x80 | ((delta >> 7) & 0x7F), delta & 0x7F)
		}
		events.push(...ev.data)
	}

	// End of track
	events.push(0x00, 0xFF, 0x2F, 0x00)

	// 轨道头
	const trackLen = events.length
	const trackHeader = [
		0x4D, 0x54, 0x72, 0x6B, // "MTrk"
		(trackLen >> 24) & 0xFF,
		(trackLen >> 16) & 0xFF,
		(trackLen >> 8) & 0xFF,
		trackLen & 0xFF,
	]

	const allBytes = [...header, ...trackHeader, ...events]
	return new Uint8Array(allBytes).buffer
}
