/**
 * 解析 SoundFont (sf2/sf3)，列出所有 preset 并按类型分类。
 * 用法: node scripts/analyze-sf3.mjs public/GeneralUserGS.sf3
 */
import { readFileSync } from "node:fs"
import { SoundBankLoader, BasicSoundBank } from "spessasynth_core"

const file = process.argv[2] || "public/GeneralUserGS.sf3"
console.log(`读取: ${file}`)
const buffer = readFileSync(file).buffer

// sf3 需要等待解码器就绪
console.log("等待 SF3 解码器就绪...")
await BasicSoundBank.isSF3DecoderReady
console.log("解码器就绪，开始解析...\n")

const bank = SoundBankLoader.fromArrayBuffer(buffer)
console.log(`文件类型: ${bank.type}`)
console.log(`Preset 总数: ${bank.presets.length}`)
console.log(`Instrument 总数: ${bank.instruments.length}`)
console.log(`Sample 总数: ${bank.samples.length}`)
console.log("")

// 按 bank 分组
const byBank = new Map()
for (const p of bank.presets) {
    const b = p.bankMSB
    if (!byBank.has(b)) byBank.set(b, [])
    byBank.get(b).push(p)
}

// 分类规则
function classify(p) {
    const name = p.name.toLowerCase()
    // 合成波形（基本波形）
    const synthWavePatterns = [
        /^0\s*sine/, /^0\s*saw/, /^0\s*pulse/, /^0\s*triangle/, /^0\s*ramp/, /^0\s*noise/,
        /^\+\d/, /^5th\s*saw/, /sine\s*wave/i, /saw\s*wave/i
    ]
    // 音效类
    const sfxPatterns = [
        /bird|seashore|helicopter|gun\s*shot|rain|thunder|train|boat|breath|whistle\s*sound/i,
        /solar\s*wind|shooting\s*star|night\s*vision|white\s*noise/i
    ]

    if (p.isDrum) return { type: "drum", icon: "🥁" }
    for (const re of synthWavePatterns) if (re.test(name)) return { type: "synth", icon: "〰️" }
    for (const re of sfxPatterns) if (re.test(name)) return { type: "sfx", icon: "🌊" }
    return { type: "instrument", icon: "🎵" }
}

// 输出每个 preset 的完整信息
console.log("=" .repeat(80))
console.log("完整 Preset 列表（按 bank 分组）")
console.log("=" .repeat(80))

const sortedBanks = [...byBank.keys()].sort((a, b) => a - b)
const stats = { instrument: 0, drum: 0, synth: 0, sfx: 0 }

for (const b of sortedBanks) {
    const presets = byBank.get(b).sort((a, c) => a.program - c.program)
    console.log(`\n── Bank ${String(b).padStart(3, "0")} (${presets.length} 个) ──`)
    for (const p of presets) {
        const c = classify(p)
        stats[c.type]++
        const bankStr = String(p.bankMSB).padStart(3, "0")
        const progStr = String(p.program).padStart(3, "0")
        const drumTag = p.isDrum ? " [鼓]" : ""
        console.log(`  ${c.icon} ${bankStr}:${progStr}  ${p.name}${drumTag}`)
    }
}

console.log("\n" + "=" .repeat(80))
console.log("统计")
console.log("=" .repeat(80))
console.log(`🎵 真实采样乐器: ${stats.instrument}`)
console.log(`🥁 鼓组:         ${stats.drum}`)
console.log(`〰️ 合成波形:     ${stats.synth}`)
console.log(`🌊 音效:         ${stats.sfx}`)
console.log(`   合计:         ${bank.presets.length}`)
