/**
 * SF2 → SF3 转换器（用 ffmpeg 做 vorbis 编码，Node 原生运行）
 *
 * 流程：
 *   1. spessasynth_core 加载 sf2
 *   2. 对每个样本：提取 PCM → ffmpeg 编码成 ogg vorbis → 返回 Uint8Array
 *   3. spessasynth_core 用 setSampleFormat 应用压缩
 *   4. writeSF2 输出 sf3 格式
 *
 * 用法: node scripts/sf2-to-sf3.mjs <input.sf2> <output.sf3> [quality]
 *   quality: vorbis 质量 0-10，默认 3.0
 */
import { readFileSync, writeFileSync } from "node:fs"
import { spawn } from "node:child_process"
import { SoundBankLoader, BasicSoundBank } from "spessasynth_core"

const INPUT = process.argv[2] || "public/GeneralUserGS-trimmed-full.sf2"
const OUTPUT = process.argv[3] || "public/GeneralUserGS-trimmed.sf3"
const QUALITY = parseFloat(process.argv[4] || "3.0")

/**
 * 用 ffmpeg 把 Float32 PCM 编码成 Ogg Vorbis
 * spessasynth 的 compressionFunction 签名: (audioData: Float32Array, sampleRate: number) => Promise<Uint8Array>
 */
async function encodeVorbis(audioData, sampleRate) {
    // audioData 是 Float32Array (-1.0 到 1.0)
    // ffmpeg 输入: raw float32le PCM
    // ffmpeg 输出: ogg vorbis

    // 把 Float32Array 转成 Buffer
    const inputBuf = Buffer.from(audioData.buffer, audioData.byteOffset, audioData.byteLength)

    return new Promise((resolve, reject) => {
        const ffmpeg = spawn("/opt/homebrew/opt/ffmpeg-full/bin/ffmpeg", [
            "-f", "f32le",              // 输入格式: 32-bit float little-endian
            "-ar", String(sampleRate),  // 采样率
            "-ac", "1",                 // 单声道
            "-i", "pipe:0",             // 从 stdin 读
            "-c:a", "libvorbis",        // vorbis 编码器
            "-q:a", String(QUALITY),    // 质量 (0-10)
            "-f", "ogg",                // 输出 ogg 容器
            "pipe:1"                    // 写到 stdout
        ], { stdio: ["pipe", "pipe", "pipe"] })

        const chunks = []
        ffmpeg.stdout.on("data", (chunk) => chunks.push(chunk))
        ffmpeg.stderr.on("data", () => {})  // 静默 stderr

        ffmpeg.on("close", (code) => {
            if (code !== 0) {
                reject(new Error(`ffmpeg 退出码 ${code}`))
            } else {
                resolve(new Uint8Array(Buffer.concat(chunks)))
            }
        })
        ffmpeg.on("error", reject)
        ffmpeg.stdin.on("error", () => {})  // 忽略 EPIPE

        ffmpeg.stdin.write(inputBuf)
        ffmpeg.stdin.end()
    })
}

async function main() {
    console.log(`读取: ${INPUT}`)
    const buffer = readFileSync(INPUT).buffer

    console.log("等待 SF3 解码器就绪...")
    await BasicSoundBank.isSF3DecoderReady

    console.log("解析中...")
    const bank = SoundBankLoader.fromArrayBuffer(buffer)
    console.log(`Preset: ${bank.presets.length}, Sample: ${bank.samples.length}`)
    console.log(`质量: vorbis -q:a ${QUALITY}`)
    console.log("")

    const total = bank.samples.length
    let done = 0
    const t0 = Date.now()

    console.log("开始压缩（逐样本 vorbis 编码）...")
    await bank.setSampleFormat({
        format: "compressed",
        compressionFunction: async (audioData, sampleRate) => {
            const result = await encodeVorbis(audioData, sampleRate)
            done++
            if (done % 20 === 0 || done === total) {
                const elapsed = ((Date.now() - t0) / 1000).toFixed(1)
                process.stdout.write(`\r  进度: ${done}/${total} (${elapsed}s)`)
            }
            return result
        }
    })
    console.log("")

    console.log("写出 SF3...")
    const sf3Data = bank.writeSF2()
    writeFileSync(OUTPUT, Buffer.from(sf3Data))

    const elapsed = ((Date.now() - t0) / 1000).toFixed(1)
    const inMB = (buffer.byteLength / 1024 / 1024).toFixed(2)
    const outMB = (sf3Data.byteLength / 1024 / 1024).toFixed(2)
    console.log("")
    console.log("============================================================")
    console.log(`✅ 完成！耗时 ${elapsed}s`)
    console.log(`   输入: ${inMB} MB`)
    console.log(`   输出: ${outMB} MB (${OUTPUT})`)
    console.log(`   压缩比: ${(buffer.byteLength / sf3Data.byteLength).toFixed(2)} : 1`)
    console.log("============================================================")
}

main().catch(e => {
    console.error("❌ 失败:", e)
    process.exit(1)
})
