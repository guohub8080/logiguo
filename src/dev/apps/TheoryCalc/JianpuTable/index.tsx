/** @jsxImportSource react */
/**
 * 简谱对应表 —— 给定根音，列出该调 1-7 级音在其他调里的简谱表示
 *
 * 算法：
 * 1. 选中调 getNoteByIntervalString("1"~"7") 得到 7 个 Note
 * 2. 对目标调根音，如果比音高就降八度（让根音在音的下方）
 * 3. getIntervalByComparingNotes(根音, 音) 得到音程
 * 4. numWithinOctave = 简谱数字，type 转升降前缀
 */
import React, { useState, useMemo } from "react"
import { getNote, getIntervalByComparingNotes } from "music12"
import NoteText from "@music-comps/NoteText/NoteText.tsx"

// 12 个等音组（C#/Db 合并为一行，共用 pianoKeyId）
// enharmonic: 等音的第二个表示（没有则为 null）
const KEYS: { label: string; step: string; alter: number; enharmonic?: { step: string; alter: number } }[] = [
	{ label: "C",       step: "C", alter: 0 },
	{ label: "C#/Db",   step: "C", alter: 1, enharmonic: { step: "D", alter: -1 } },
	{ label: "D",       step: "D", alter: 0 },
	{ label: "D#/Eb",   step: "D", alter: 1, enharmonic: { step: "E", alter: -1 } },
	{ label: "E",       step: "E", alter: 0 },
	{ label: "F",       step: "F", alter: 0 },
	{ label: "F#/Gb",   step: "F", alter: 1, enharmonic: { step: "G", alter: -1 } },
	{ label: "G",       step: "G", alter: 0 },
	{ label: "G#/Ab",   step: "G", alter: 1, enharmonic: { step: "A", alter: -1 } },
	{ label: "A",       step: "A", alter: 0 },
	{ label: "A#/Bb",   step: "A", alter: 1, enharmonic: { step: "B", alter: -1 } },
	{ label: "B",       step: "B", alter: 0 },
]

const DEGREES = ["1", "2", "3", "4", "5", "6", "7"]

// pianoKeyId (0-11) → 音名
const PIANOKEY_NAMES = ["C", "C#/Db", "D", "D#/Eb", "E", "F", "F#/Gb", "G", "G#/Ab", "A", "A#/Bb", "B"]

// 大调各度数的半音偏移：1=0, 2=2, 3=4, 4=5, 5=7, 6=9, 7=11
const MAJOR_SEMITONES = [0, 2, 4, 5, 7, 9, 11]

// pianoKeyId → 对应的 step（CDEFGAB）
const PIANOKEY_STEPS = ["C", "C", "D", "D", "E", "F", "F", "G", "G", "A", "A", "B"]

/**
 * 为一整行（一个目标调）计算 7 个音的简谱
 * 算法：
 * 1. 对每个音，按半音差找出所有候选简谱标记（自然/升/降）
 * 2. 每个候选的 step 来自该候选度数升降后的实际音名 step
 * 3. 优先选自然音
 * 4. 保证 1-7 每个度数只用一次（step 不重复）
 */
function calcRowJianpu(notePianoKeyIds: number[], rootPianoKeyId: number): string[] {

	// 度数 i(0-6) 的基础 step: 1=C, 2=D, 3=E, 4=F, 5=G, 6=A, 7=B
	const DEGREE_STEPS = ["C", "D", "E", "F", "G", "A", "B"]

	// 对每个音，算半音差和候选（纯半音匹配，step 用于去重选择）
	const candidates = notePianoKeyIds.map(pkId => {
		const diff = (pkId - rootPianoKeyId + 12) % 12
		const options: { degree: number; alter: number; step: string }[] = []
		// 自然音
		for (let i = 0; i < 7; i++) {
			if (MAJOR_SEMITONES[i] === diff) {
				options.push({ degree: i + 1, alter: 0, step: DEGREE_STEPS[i] })
			}
		}
		// 升：#i = 度数 i 的根音升半音，step 仍是 DEGREE_STEPS[i]
		for (let i = 0; i < 7; i++) {
			if ((MAJOR_SEMITONES[i] + 1) % 12 === diff) {
				options.push({ degree: i + 1, alter: 1, step: DEGREE_STEPS[i] })
			}
		}
		// 降：bi = 度数 i 的根音降半音，step 仍是 DEGREE_STEPS[i]
		for (let i = 0; i < 7; i++) {
			if ((MAJOR_SEMITONES[i] + 11) % 12 === diff) {
				options.push({ degree: i + 1, alter: -1, step: DEGREE_STEPS[i] })
			}
		}
		return options
	})

	// 回溯分配：保证 1-7 每个度数只出现一次 + 每个 step 只出现一次
	// 优先自然音，冲突时尝试其他候选
	const results: string[] = new Array(notePianoKeyIds.length).fill("?")

	// 排序候选索引：候选少的优先（约束传播，先处理选择最少的音）
	const order = candidates
		.map((opts, colIdx) => ({ opts, colIdx }))
		.sort((a, b) => a.opts.length - b.opts.length)
	const sortedCandidates = order.map(o => o.opts)
	const originalIdx = order.map(o => o.colIdx)

	// 在排序后的数组上回溯
	const sortedResults: string[] = new Array(sortedCandidates.length).fill("?")

	function tryAssignSorted(idx: number, usedDeg: Set<number>, usedStp: Set<string>): boolean {
		if (idx >= sortedCandidates.length) return true
		const opts = sortedCandidates[idx]
		const sortedOpts = [...opts].sort((a, b) => {
			if (a.alter !== b.alter) return a.alter - b.alter
			return a.degree - b.degree
		})
		for (const opt of sortedOpts) {
			if (usedDeg.has(opt.degree) || usedStp.has(opt.step)) continue
			const prefix = opt.alter === 1 ? "#" : opt.alter === -1 ? "b" : ""
			sortedResults[idx] = prefix + opt.degree
			usedDeg.add(opt.degree)
			usedStp.add(opt.step)
			if (tryAssignSorted(idx + 1, usedDeg, usedStp)) return true
			usedDeg.delete(opt.degree)
			usedStp.delete(opt.step)
			sortedResults[idx] = "?"
		}
		return false
	}

	tryAssignSorted(0, new Set(), new Set())

	// 还原到原始顺序
	sortedResults.forEach((val, i) => {
		results[originalIdx[i]] = val
	})

	return results
}

// 选中调的 1-7 级音的 pianoKeyId
function getScalePianoKeyIds(step: string, alter: number): number[] {
	const root = getNote(step, alter, 4)
	return DEGREES.map(d => {
		try {
			return root.getNoteByIntervalString(d).pianoKeyId
		} catch {
			return -1
		}
	})
}

export default function JianpuTable() {
	const [selectedKeyIdx, setSelectedKeyIdx] = useState(0)

	// 选中调的 1-7 级 pianoKeyId
	const scalePianoKeyIds = useMemo(() => {
		const k = KEYS[selectedKeyIdx]
		return getScalePianoKeyIds(k.step, k.alter)
	}, [selectedKeyIdx])

	// 所有目标调的根音 pianoKeyId
	const allRootPianoKeyIds = useMemo(() => {
		return KEYS.map(k => getNote(k.step, k.alter, 4).pianoKeyId)
	}, [])

	return (
		<div className="max-w-2xl mx-auto px-4 py-8">
			{/* 根音选择器 */}
			<div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
				<span className="text-sm font-medium text-muted-foreground shrink-0">根音</span>
				{KEYS.map((k, i) => (
					<button
						key={i}
						onClick={() => setSelectedKeyIdx(i)}
						className={`px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition-all duration-150
							${selectedKeyIdx === i
								? "bg-primary text-primary-foreground shadow-md shadow-primary/25 scale-105"
								: "bg-card/80 backdrop-blur border border-border/60 hover:border-primary/30 hover:bg-accent/50"
							}`}
					>
						{k.label}
					</button>
				))}
			</div>

			{/* 表格 */}
			<div className="overflow-x-auto rounded-2xl border border-border/60 shadow-sm bg-card">
				<table className="w-full border-collapse text-sm table-fixed">
					<thead>
						<tr className="bg-muted/60">
							<th className="sticky left-0 z-10 bg-muted/60 px-3 py-3 text-center font-semibold text-muted-foreground border-b border-r border-border/60 w-16">
								调
							</th>
							{DEGREES.map(d => {
								const pkId = scalePianoKeyIds[parseInt(d) - 1] ?? 0
								const headData = [
									{ step: "C", alter: 0 },
									{ step: "C", alter: 1, enh: { step: "D", alter: -1 } },
									{ step: "D", alter: 0 },
									{ step: "D", alter: 1, enh: { step: "E", alter: -1 } },
									{ step: "E", alter: 0 },
									{ step: "F", alter: 0 },
									{ step: "F", alter: 1, enh: { step: "G", alter: -1 } },
									{ step: "G", alter: 0 },
									{ step: "G", alter: 1, enh: { step: "A", alter: -1 } },
									{ step: "A", alter: 0 },
									{ step: "A", alter: 1, enh: { step: "B", alter: -1 } },
									{ step: "B", alter: 0 },
								]
								const h = headData[pkId]
								return (
									<th key={d} className="px-2 py-3 text-center font-semibold text-foreground/80 border-b border-r border-border/60 whitespace-nowrap">
										<div className="flex items-center justify-center gap-0.5">
											<NoteText step={h.step} alter={h.alter} fontSize={15} />
											{h.enh && <>
												<span className="text-muted-foreground/50 text-xs">/</span>
												<NoteText step={h.enh.step} alter={h.enh.alter} fontSize={15} />
											</>}
										</div>
									</th>
								)
							})}
							</tr>
					</thead>
					<tbody>
					{KEYS.map((k, rowIdx) => {
						const targetRoot = allRootPianoKeyIds[rowIdx]
						let rowCells: string[]
						if (rowIdx === selectedKeyIdx) {
							rowCells = ["1", "2", "3", "4", "5", "6", "7"]
						} else if (scalePianoKeyIds.includes(-1)) {
							rowCells = scalePianoKeyIds.map(() => "—")
						} else {
							rowCells = calcRowJianpu(scalePianoKeyIds, targetRoot)
						}
							const isSelected = rowIdx === selectedKeyIdx
							const isBlackKey = k.label.includes("#") || k.label.includes("b")
							return (
								<tr
									key={rowIdx}
									className={`${isSelected ? "bg-primary/8" : isBlackKey ? "bg-muted/35" : "bg-card"} hover:bg-accent/40 transition-colors`}
								>
										<td className={`sticky left-0 z-10 px-3 py-2 text-center font-semibold border-r border-border/60
											${isSelected ? "bg-primary/12 text-primary" : isBlackKey ? "bg-muted/35" : "bg-card"}`}
										>
											<div className="flex items-center justify-center gap-0.5">
												<NoteText step={k.step} alter={k.alter} fontSize={14}
													color={isSelected ? "var(--color-primary)" : undefined} />
												{k.enharmonic && <>
													<span className="text-muted-foreground/50 text-xs">/</span>
													<NoteText step={k.enharmonic.step} alter={k.enharmonic.alter} fontSize={14}
														color={isSelected ? "var(--color-primary)" : undefined} />
												</>}
											</div>
										</td>
								{rowCells.map((cell, colIdx) => {
										// 解析简谱字符串 → step + alter
										// "b7" → step=B, alter=-1; "#4" → step=F, alter=1; "3" → step=E, alter=0
										const DEGREE_TO_STEP = ["C", "D", "E", "F", "G", "A", "B"]
										let alter = 0
										let numStr = cell
										if (cell.startsWith("#")) { alter = 1; numStr = cell.slice(1) }
										else if (cell.startsWith("b")) { alter = -1; numStr = cell.slice(1) }
										const degree = parseInt(numStr)
										const step = DEGREE_TO_STEP[degree - 1] ?? "?"
										const isNatural = alter !== 0
										return (
											<td
												key={colIdx}
												className={`px-2 py-2 text-center border-b border-r border-border/40
													${isSelected ? "text-primary font-bold" : "text-foreground"}`}
											>
												<div className="flex items-center justify-center">
													<NoteText step={step} alter={alter} notation="arabic" fontSize={19}
														color={isSelected ? "var(--color-primary)" : undefined} isNatural={isNatural} />
												</div>
											</td>
										)
									})}
									</tr>
							)
						})}
					</tbody>
				</table>
			</div>
		</div>
	)
}
