import {css} from "@emotion/react";
import googleColors from "@assets/colors/googleColors.ts";
import cssPresets from "@styles/preset/cssPresets.ts";
import {isMobile} from "react-device-detect";
import { isFunction } from "es-toolkit/predicate";
import { defaultTo, range } from "es-toolkit/compat";
import type {OctavePianoConfig, KeyConfig} from "./config";

const isBlackKey = (i: number) => [1, 3, 6, 8, 10].includes(i);

export const buildPianoStyle = (config: OctavePianoConfig, keys: KeyConfig[] | undefined, isPureDisplay: boolean, ml: number) => {
  const blackKeyWidth = config.whiteKeyWidth * config.blackKeyWidthRatio
  const blackKeyHeight = config.whiteKeyHeight * config.blackKeyHeightRatio
  const wk_radius_css = {}
  const bk_radius_css = {}
  const key_color_css = {}
  config.whiteKeyBorderRadius.map((r, y) => {
    wk_radius_css[`& .wk:nth-of-type(${y + 1})`] = {
      borderTopLeftRadius: r.tl ?? 0,
      borderTopRightRadius: r.tr ?? 0,
      borderBottomRightRadius: r.br ?? 0,
      borderBottomLeftRadius: r.bl ?? 0,
    }
  })
  config.blackKeyBorderRadius.map((r, y) => {
    bk_radius_css[`& .bk:nth-of-type(${y + 1})`] = {
      borderTopLeftRadius: r.tl ?? 0,
      borderTopRightRadius: r.tr ?? 0,
      borderBottomRightRadius: r.br ?? 0,
      borderBottomLeftRadius: r.bl ?? 0,
    }
  })

  const resolveBgColor = (id: number): string | null => {
    const keyConf = keys?.[id]
    const bgColor = keyConf?.bgColor
    if (isFunction(bgColor)) return bgColor(id) ?? null
    return bgColor ?? null
  }

  const allKeyIds = range(12);
  allKeyIds.forEach(id => {
    const color = resolveBgColor(id)
    if (color !== null) {
      key_color_css[`& .k${id}`] = { background: color }
    }
  })

  const hover_css = {}
  if (!isPureDisplay && !isMobile) {
    allKeyIds.forEach(id => {
      const keyConf = keys?.[id]
      const defaultHover = isBlackKey(id) ? config.defaultBlackKeyHoverColor : config.defaultWhiteKeyHoverColor
      let hoverColor: string
      if (keyConf?.hoverColor) {
        if (isFunction(keyConf.hoverColor)) {
          const result = keyConf.hoverColor(id)
          hoverColor = result ?? defaultHover
        } else {
          hoverColor = keyConf.hoverColor
        }
      } else {
        hoverColor = defaultHover
      }
      // hover 永远用 background 覆盖渐变（backgroundColor 会被 background 简写覆盖）
      hover_css[`& .k${id}:hover`] = { background: hoverColor }
    })
  }

  const keyCursor = isPureDisplay ? "default" : "pointer";

  return css({
      boxSizing: "border-box",
      height: config.whiteKeyHeight,
      marginLeft: ml,
      display: "block",
      width: config.whiteKeyGap === 0 ? config.whiteKeyWidth * 7 - config.whiteKeyBorderWidth * 6 :
        (config.whiteKeyWidth + config.whiteKeyGap) * 6 + config.whiteKeyWidth,
      ...key_color_css,
      ...hover_css,
      "& .white_keys_frame": {
        display: "flex",
        zIndex: 0,
        height: config.whiteKeyHeight,
        ...wk_radius_css,
        "& .wk": {
          minWidth: config.whiteKeyWidth,
          maxWidth: config.whiteKeyWidth,
          height: config.whiteKeyHeight,
          border: `${config.whiteKeyBorderWidth}px solid ${config.defaultWhiteKeyBorderColor}`,
          background: "linear-gradient(to bottom, #eeeeee 0%, #f6f6f6 8%, #ffffff 25%, #ffffff 80%, #f5f5f5 100%)",
          boxShadow: [
            // 顶部高光
            "inset 0 1px 0 rgba(255,255,255,0.95)",
            // 中部柔光带
            "inset 0 5px 7px -6px rgba(255,255,255,0.5)",
            // 底部前缘厚度暗线（浅灰）
            "inset 0 -4px 0 #e2e2e2",
            // 左右微暗
            "inset 2px 0 1px rgba(0,0,0,0.05)",
            "inset -2px 0 1px rgba(0,0,0,0.05)",
            // 底部外投影（收敛）
            "0 1px 2px rgba(0,0,0,0.08)",
            "0 3px 4px -1px rgba(0,0,0,0.04)",
          ].join(", "),
          marginRight: config.whiteKeyGap === 0 ? -1 * config.whiteKeyBorderWidth : config.whiteKeyGap,
          cursor: keyCursor,
          userSelect: "none",
          transition: "box-shadow 0.06s ease",
          ...cssPresets.flexCenter as any,
          alignItems: "end",
          paddingBottom: 3,
          "&:hover": {
            background: config.defaultWhiteKeyHoverColor,
          },
          "&:active": {
            background: "linear-gradient(to bottom, #edebe6 0%, #f0eee8 30%, #e5e2db 100%)",
            boxShadow: [
              "inset 0 1px 0 rgba(255,255,255,0.4)",
              "inset 0 -2px 0 #c5c0b5",
              "inset 0 4px 7px rgba(0,0,0,0.1)",
            ].join(", "),
          },
        },

      },
      "& .black_keys_frame": {
        ...bk_radius_css,
        display: "flex",
        marginTop: -1 * config.whiteKeyHeight,
        zIndex: 999,
        marginLeft: config.whiteKeyGap === 0 ?
          config.whiteKeyWidth + (config.whiteKeyGap - blackKeyWidth) / 2 - config.whiteKeyBorderWidth / 2
          : config.whiteKeyWidth + (config.whiteKeyGap - blackKeyWidth) / 2,
        "& .bk": {
          height: blackKeyHeight,
          width: blackKeyWidth,
          marginRight: config.whiteKeyGap === 0 ?
            config.whiteKeyWidth - blackKeyWidth - config.whiteKeyBorderWidth :
            config.whiteKeyWidth + config.whiteKeyGap - blackKeyWidth,
          cursor: keyCursor,
          userSelect: "none",
          border: `${config.blackKeyBorderWidth}px solid #0a0a0a`,
          background: "linear-gradient(to bottom, #252525 0%, #0d0d0d 30%, #000000 80%, #1a1a1a 100%)",
          boxShadow: [
            "inset 0 1px 0 rgba(255,255,255,0.07)",
            "inset 0 -1px 0 #333333",
            "0 1px 2px rgba(0,0,0,0.2)",
          ].join(", "),
          borderRadius: "0 0 4px 4px",
          transition: "box-shadow 0.06s ease",
          ...cssPresets.flexCenter as any,
          alignItems: "end",
          paddingBottom: 3,
          "&:hover": {
            background: config.defaultBlackKeyHoverColor,
          },
          "&:active": {
            background: "linear-gradient(to bottom, #000000 0%, #000000 60%, #1a1a1a 100%)",
            boxShadow: [
              "inset 0 1px 0 rgba(255,255,255,0.02)",
              "inset 0 -1px 0 #222222",
              "inset 0 4px 8px rgba(0,0,0,0.6)",
            ].join(", "),
          },
        },
        "& div.bk:nth-of-type(2)": {
          marginRight: config.whiteKeyGap === 0 ?
            config.whiteKeyWidth * 2 - config.whiteKeyBorderWidth * 2 - blackKeyWidth :
            config.whiteKeyWidth * 2 + config.whiteKeyGap * 2 - blackKeyWidth,
        },

      },

    }
  )
}
