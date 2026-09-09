/**
 * 裁剪 GeneralUser GS sf3 —— 精简为钢琴+弦乐+木管铜管+基础鼓+常用合成器
 *
 * 保留逻辑：白名单（bank 0 的特定 program + 鼓组）。
 * 删除：所有扩展 bank、合成波形、音效、重复变体、吉他/贝斯/风琴等非保留类。
 *
 * 输出：trimmed.sf2（再用 Polyphone CLI 转 sf3）
 */
import { readFileSync, writeFileSync } from "node:fs"
import { SoundBankLoader, BasicSoundBank } from "spessasynth_core"

const INPUT = process.argv[2] || "public/GeneralUserGS.sf3"
const OUTPUT_SF2 = process.argv[3] || "public/GeneralUserGS-trimmed.sf2"

// ============================================================
// 保留白名单 —— 只留 bank 0 的这些 program 号
// ============================================================
const KEEP_PROGRAMS = new Set([
	// 钢琴家族 (去掉 001/002/003/007)
	0, 4, 5, 6,
	// 美妙打击乐（有音高，去掉 009 Glockenspiel / 013 Xylophone）
	8, 11, 12,             // Celeste/Vibraphone/Marimba
	// 弦乐：只留合奏（去掉独奏提琴 40-45）
	// 046 Harp 竖琴 / 047 Timpani 定音鼓 / 048 Fast Strings / 049 Slow Strings
	46, 47, 48, 49,
	// 合成弦乐（只留 1 个）
	50,
	// 铜管（小号/长号/弱音小号/圆号，去掉 058 Tuba）
	56, 57, 59, 60,
	// 木管（Alto Sax + 双簧管/巴松/单簧管，去掉 069 English Horn）
	65, 68, 70, 71,
	// 长笛（只留标准长笛）
	73,
	// 合成 Lead（Square + Saw 代表）
	80, 81,
	// 合成 Pad（Fantasia + Warm Pad）
	88, 89,
])

console.log(`读取: ${INPUT}`)
const buffer = readFileSync(INPUT).buffer

console.log("等待 SF3 解码器就绪...")
await BasicSoundBank.isSF3DecoderReady
console.log("开始解析...\n")

const bank = SoundBankLoader.fromArrayBuffer(buffer)
const before = {
	presets: bank.presets.length,
	instruments: bank.instruments.length,
	samples: bank.samples.length,
}

// 找出要删除的 preset：
// 鼓组（isDrum）：只保留 bank 0 program 0 的 Standard 1（channel 9 用 program 匹配）
// 普通乐器：只留 bank 0 且在白名单里
const toDelete = []
const kept = []
for (const p of bank.presets) {
	if (p.isDrum) {
		if (p.bankMSB === 0 && p.program === 0) {
			kept.push(p)
		} else {
			toDelete.push(p)
		}
		continue
	}
	if (p.bankMSB === 0 && KEEP_PROGRAMS.has(p.program)) {
		kept.push(p)
	} else {
		toDelete.push(p)
	}
}

console.log(`将保留 ${kept.length} 个 preset：`)
for (const p of kept) {
	const bankStr = String(p.bankMSB).padStart(3, "0")
	const progStr = String(p.program).padStart(3, "0")
	console.log(`  ${bankStr}:${progStr}  ${p.name}${p.isDrum ? " [鼓]" : ""}`)
}
console.log(`\n将删除 ${toDelete.length} 个 preset`)

// 执行删除
for (const p of toDelete) {
	bank.deletePreset(p)
}

// 清理孤儿 instrument 和 sample（这步才是真正瘦身）
console.log("\n清理未引用的 instrument 和 sample...")
bank.removeUnusedElements()

const after = {
	presets: bank.presets.length,
	instruments: bank.instruments.length,
	samples: bank.samples.length,
}

console.log("\n============================================================")
console.log("裁剪结果")
console.log("============================================================")
console.log(`Preset:      ${before.presets} → ${after.presets}`)
console.log(`Instrument:  ${before.instruments} → ${after.instruments}`)
console.log(`Sample:      ${before.samples} → ${after.samples}`)

// 写出 sf2
console.log(`\n写出 SF2: ${OUTPUT_SF2}`)
const sf2Data = bank.writeSF2({ software: "guookcase-trim" })
writeFileSync(OUTPUT_SF2, Buffer.from(sf2Data))
console.log(`SF2 大小: ${(sf2Data.byteLength / 1024 / 1024).toFixed(2)} MB`)
console.log("\n下一步：用 Polyphone CLI 把 sf2 转成 sf3：")
console.log(`  polyphone -2 -i ${OUTPUT_SF2} -c 2`)
