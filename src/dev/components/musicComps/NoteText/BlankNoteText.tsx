/** @jsxImportSource @emotion/react */
import { defaultTo } from "es-toolkit/compat";
import {css} from "@emotion/react";
import cssPresets from "@styles/preset/cssPresets.ts";
import googleColors from "@assets/colors/googleColors.ts";

const BlankNoteText = (props: {
  blankString?: string,
  fontSize?: number,
  isNatural?: boolean,
  color?: string,
}) => {
  const noteColor = defaultTo(props.color, googleColors.gray800)
  const blankString = defaultTo(props.blankString, "?")
  const fontSize = defaultTo(props.fontSize, 14)
  return <div css={note_text_css(fontSize, noteColor)}>
    <div className="step">
      {blankString}
    </div>
  </div>
}

export default BlankNoteText

const note_text_css = (fontSize: number, noteColor: string) => css({
  ...cssPresets.flexCenter,
  height: fontSize,
  "& .step": {
    fontSize: fontSize,
    textAlign: "center",
    color: noteColor,
  },
})
