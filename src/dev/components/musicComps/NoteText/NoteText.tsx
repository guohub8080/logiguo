/** @jsxImportSource @emotion/react */
import { defaultTo } from "es-toolkit/compat";
import {css} from "@emotion/react";
import NoteSymbol from "@music-comps/NoteSymbol";
import cssPresets from "@styles/preset/cssPresets.ts";
import googleColors from "@assets/colors/googleColors.ts";

export type NotationMode = 'upper' | 'lower' | 'roman-upper' | 'roman-lower' | 'arabic';
export type NoteFont = 'sans' | 'serif';

const FONT_FAMILY: Record<NoteFont, string> = {
  sans: 'note-sans, sans-serif',
  serif: 'note-serif, serif',
};

const STEP_MAP: Record<string, Record<NotationMode, string>> = {
  C: { upper: 'C', lower: 'c', 'roman-upper': 'I', 'roman-lower': 'i', arabic: '1' },
  D: { upper: 'D', lower: 'd', 'roman-upper': 'II', 'roman-lower': 'ii', arabic: '2' },
  E: { upper: 'E', lower: 'e', 'roman-upper': 'III', 'roman-lower': 'iii', arabic: '3' },
  F: { upper: 'F', lower: 'f', 'roman-upper': 'IV', 'roman-lower': 'iv', arabic: '4' },
  G: { upper: 'G', lower: 'g', 'roman-upper': 'V', 'roman-lower': 'v', arabic: '5' },
  A: { upper: 'A', lower: 'a', 'roman-upper': 'VI', 'roman-lower': 'vi', arabic: '6' },
  B: { upper: 'B', lower: 'b', 'roman-upper': 'VII', 'roman-lower': 'vii', arabic: '7' },
};

const NoteText = (props: {
  step: string,
  alter: number,
  fontSize?: number,
  isNatural?: boolean,
  color?: string,
  notation?: NotationMode,
  serif?: boolean,
}) => {
  const noteColor = defaultTo(props.color, googleColors.gray800)
  const isNatural = defaultTo(props.isNatural, false)
  const fontSize = defaultTo(props.fontSize, 14)
  const notation = defaultTo(props.notation, 'upper')
  const fontFamily = props.serif ? FONT_FAMILY.serif : FONT_FAMILY.sans
  const fontWeight = props.serif ? 500 : 370
  const isShowNatural = !isNatural && props.alter === 0
  const displayStep = STEP_MAP[props.step]?.[notation] ?? props.step

  return <div css={note_text_css(fontSize, noteColor, props.alter, fontFamily, fontWeight)} data-component="NoteText">
    <div className="step">
      {displayStep}
    </div>
    {!isShowNatural && <div className="alter">
        <NoteSymbol alter={props.alter} color={noteColor}/>
    </div>}
  </div>
}

export default NoteText

const note_text_css = (fontSize: number, noteColor: string, alter: number, fontFamily: string, fontWeight?: number) => css({
  userSelect: "none",
  fontFamily,
  fontWeight,
  ...cssPresets.flexCenter,
  height:fontSize,
  "& .step": {
    fontSize: fontSize,
    textAlign: "center",
    minWidth: 0,
    flexShrink: 1,
    color: noteColor,
  },
  "& .alter": {
    height: fontSize * 0.75,
    marginLeft:1,
    width: alter === -2 ? fontSize * 0.45 : fontSize * 0.3,
    ...cssPresets.flexCenter,
  }
})
