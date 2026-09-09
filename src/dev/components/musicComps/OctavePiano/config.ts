import googleColors from "@assets/colors/googleColors.ts";
import type { ReactNode } from "react";

export type BorderRadius = { tl?: number; tr?: number; bl?: number; br?: number };

export type KeyConfig = {
  bgColor?: string | ((pianoKeyId: number) => string)
  hoverColor?: string | ((pianoKeyId: number) => string)
  node?: ReactNode
  onClick?: () => void
  onMouseEnter?: () => void
  onMouseDown?: () => void
}

export type OctavePianoConfig = {
  whiteKeyWidth?: number
  whiteKeyHeight?: number
  blackKeyWidthRatio?: number
  blackKeyHeightRatio?: number
  whiteKeyBorderRadius?: BorderRadius[]
  blackKeyBorderRadius?: BorderRadius[]
  whiteKeyBorderWidth?: number
  blackKeyBorderWidth?: number
  whiteKeyGap?: number
  defaultBlackKeyColor?: string
  defaultWhiteKeyColor?: string
  defaultBlackKeyBorderColor?: string
  defaultWhiteKeyBorderColor?: string
  defaultWhiteKeyHoverColor?: string
  defaultBlackKeyHoverColor?: string
}

export const defaultPianoConfig: OctavePianoConfig = {
  whiteKeyWidth: 40,
  whiteKeyHeight: 120,
  blackKeyWidthRatio: 0.7,
  blackKeyHeightRatio: 0.6,
  whiteKeyBorderRadius: Array.from({length: 7}, () => ({ tl: 0, tr: 0, bl: 5, br: 5 })),
  blackKeyBorderRadius: Array.from({length: 6}, () => ({ tl: 0, tr: 0, bl: 4, br: 4 })),
  whiteKeyBorderWidth: 2,
  blackKeyBorderWidth: 2,
  whiteKeyGap: 0,
  defaultBlackKeyColor: googleColors.gray800,
  defaultWhiteKeyColor: "#fff",
  defaultWhiteKeyBorderColor: googleColors.gray700,
  defaultBlackKeyBorderColor: googleColors.gray700,
  defaultWhiteKeyHoverColor: "#f0f0f0",
  defaultBlackKeyHoverColor: "#383838",
}
