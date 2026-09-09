import type { ReactNode } from 'react'

export type CirclePianoKeyConfig = {
  bgColor?: string
  node?: ReactNode
  onClick?: () => void
}

export type CirclePianoConfig = {
  // ── 几何参数 ──
  /** 圆心 x（viewBox 坐标） */
  cx?: number
  /** 圆心 y（viewBox 坐标） */
  cy?: number
  /** 琴键内半径（0 = 从圆心出发的三角形；>0 = 环形扇区） */
  innerRadius?: number
  /** 琴键外半径 */
  outerRadius?: number
  /** 背景扇叶内半径（= cover 圆盘半径） */
  bgInnerRadius?: number
  /** 背景扇叶外半径 */
  bgOuterRadius?: number
  /** 键之间的间隙角度（度），0 = 无缝 */
  gapAngle?: number
  /** 起始角度（度），-90 = 顶部正上方 */
  startAngle?: number
  // ── 样式参数（原有）──
  strokeWidth?: number
  rotation?: number
  // ── 显示开关（原有）──
  showBg?: boolean
  showStroke?: boolean
  showCover?: boolean
  showPianoKeyId?: boolean
  showNoteName?: boolean
}

/**
 * 默认配置——精确复刻原始硬编码的几何尺寸
 *
 * 原始参数（从 path 坐标逆推）：
 *   viewBox 1800×1800，圆心 (900, 900)
 *   琴键外半径 = 609.5，内半径 = 0（三角形从圆心出发）
 *   cover 圆盘半径 = 527.9
 *   背景扇叶外半径 ≈ 850
 *   每个键 30°，从正上方开始（0 号键在 12 点位置）
 */
export const defaultCirclePianoConfig: Required<CirclePianoConfig> = {
  cx: 900,
  cy: 900,
  innerRadius: 0,
  outerRadius: 609.5,
  bgInnerRadius: 527.9,
  bgOuterRadius: 850,
  gapAngle: 0,
  startAngle: 0,
  strokeWidth: 12,
  rotation: 0,
  showBg: true,
  showStroke: true,
  showCover: true,
  showPianoKeyId: true,
  showNoteName: true,
}

export const defaultCirclePianoKeys: CirclePianoKeyConfig[] = [
  { bgColor: '#ffd183' }, { bgColor: '#5a5e6e' }, { bgColor: '#ff7800' }, { bgColor: '#c1a184' },
  { bgColor: '#67ff70' }, { bgColor: '#ff001d' }, { bgColor: '#6e5a6d' }, { bgColor: '#ffa420' },
  { bgColor: '#5a5e6e' }, { bgColor: '#5a5e6e' }, { bgColor: '#e8498f' }, { bgColor: '#5a5e6e' },
]
