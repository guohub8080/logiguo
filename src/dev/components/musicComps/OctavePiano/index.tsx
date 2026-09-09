/** @jsxImportSource @emotion/react */
import { defaultTo } from "es-toolkit/compat";
import {defaultPianoConfig, type OctavePianoConfig, type KeyConfig} from "./config";
import {buildPianoStyle} from "./style";

export type {OctavePianoConfig, BorderRadius, KeyConfig} from "./config"
export {defaultPianoConfig} from "./config"

const OctavePiano = (props: {
  config?: OctavePianoConfig
  keys?: KeyConfig[]
  isPureDisplay?: boolean
  onClick?: (index: number) => void
  ml?: number
}) => {
  const config = {...defaultPianoConfig, ...props.config} as OctavePianoConfig
  const isPureDisplay = defaultTo(props.isPureDisplay, false)
  const ml = defaultTo(props.ml, 0)

  const getKey = (i: number): KeyConfig | undefined => props.keys?.[i]

  const handleClick = (i: number) => {
    if (isPureDisplay) return
    getKey(i)?.onClick?.()
    props.onClick?.(i)
  }

  const handleMouseEnter = (i: number) => {
    if (isPureDisplay) return
    getKey(i)?.onMouseEnter?.()
  }

  const handleMouseDown = (i: number) => {
    if (isPureDisplay) return
    getKey(i)?.onMouseDown?.()
  }

  const getNode = (i: number) => getKey(i)?.node

  return <>
    <div css={buildPianoStyle(config, props.keys, isPureDisplay, ml)} data-component="OctavePiano">
      <div className="white_keys_frame">
        <div className="wk k0" onClick={() => handleClick(0)} onMouseEnter={() => handleMouseEnter(0)} onMouseDown={() => handleMouseDown(0)}>
          {getNode(0)}
        </div>
        <div className="wk k2" onClick={() => handleClick(2)} onMouseEnter={() => handleMouseEnter(2)} onMouseDown={() => handleMouseDown(2)}>
          {getNode(2)}
        </div>
        <div className="wk k4" onClick={() => handleClick(4)} onMouseEnter={() => handleMouseEnter(4)} onMouseDown={() => handleMouseDown(4)}>
          {getNode(4)}
        </div>
        <div className="wk k5" onClick={() => handleClick(5)} onMouseEnter={() => handleMouseEnter(5)} onMouseDown={() => handleMouseDown(5)}>
          {getNode(5)}
        </div>
        <div className="wk k7" onClick={() => handleClick(7)} onMouseEnter={() => handleMouseEnter(7)} onMouseDown={() => handleMouseDown(7)}>
          {getNode(7)}
        </div>
        <div className="wk k9" onClick={() => handleClick(9)} onMouseEnter={() => handleMouseEnter(9)} onMouseDown={() => handleMouseDown(9)}>
          {getNode(9)}
        </div>
        <div className="wk k11" onClick={() => handleClick(11)} onMouseEnter={() => handleMouseEnter(11)} onMouseDown={() => handleMouseDown(11)}>
          {getNode(11)}
        </div>
      </div>
      <div className="black_keys_frame">
        <div className="bk k1" onClick={() => handleClick(1)} onMouseEnter={() => handleMouseEnter(1)} onMouseDown={() => handleMouseDown(1)}>
          {getNode(1)}
        </div>
        <div className="bk k3" onClick={() => handleClick(3)} onMouseEnter={() => handleMouseEnter(3)} onMouseDown={() => handleMouseDown(3)}>
          {getNode(3)}
        </div>
        <div className="bk k6" onClick={() => handleClick(6)} onMouseEnter={() => handleMouseEnter(6)} onMouseDown={() => handleMouseDown(6)}>
          {getNode(6)}
        </div>
        <div className="bk k8" onClick={() => handleClick(8)} onMouseEnter={() => handleMouseEnter(8)} onMouseDown={() => handleMouseDown(8)}>
          {getNode(8)}
        </div>
        <div className="bk k10" onClick={() => handleClick(10)} onMouseEnter={() => handleMouseEnter(10)} onMouseDown={() => handleMouseDown(10)}>
          {getNode(10)}
        </div>
      </div>
    </div>
  </>
}

export default OctavePiano
