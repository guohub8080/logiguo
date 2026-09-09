import CirclePianoSvg, { defaultCirclePianoKeys } from '@music-comps/CirclePiano/CirclePianoSvg'
import { Popover, PopoverContent, PopoverTrigger } from '@shadcn/components/ui/popover'
import { HexColorPicker } from 'react-colorful'
import { useState } from 'react'

const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

function ColorField({ label, value, onChange }: {
  label: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      <Popover>
        <PopoverTrigger asChild>
          <button className="flex items-center gap-2 rounded-md border px-2 py-1 hover:bg-accent transition">
            <div className="w-4 h-4 rounded-sm border" style={{ backgroundColor: value }} />
            <span className="text-xs font-mono">{value}</span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3" align="end">
          <HexColorPicker color={value} onChange={onChange} />
        </PopoverContent>
      </Popover>
    </div>
  )
}

const CirclePianoDemo = () => {
  const [strokeWidth, setStrokeWidth] = useState(12)
  const [rotation, setRotation] = useState(0)
  const [colors, setColors] = useState<string[]>(defaultCirclePianoKeys.map(k => k.bgColor!))

  const updateColor = (i: number, v: string) => {
    setColors(prev => prev.map((c, idx) => idx === i ? v : c))
  }

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <div className="border rounded-lg p-2 bg-white">
        <CirclePianoSvg config={{ strokeWidth, rotation }} keys={colors.map(bgColor => ({ bgColor }))} />
      </div>
      <div className="flex items-center gap-3 px-2">
        <span className="text-sm text-muted-foreground shrink-0">描边: {strokeWidth}</span>
        <input type="range" min={6} max={18} step={1} value={strokeWidth} onChange={(e) => setStrokeWidth(Number(e.target.value))} className="w-full" />
      </div>
      <div className="flex items-center gap-3 px-2">
        <span className="text-sm text-muted-foreground shrink-0">旋转: {rotation}°</span>
        <input type="range" min={-180} max={180} step={1} value={rotation} onChange={(e) => setRotation(Number(e.target.value))} className="w-full" />
      </div>
      <div className="grid grid-cols-2 gap-2 px-2">
        {noteNames.map((name, i) => (
          <ColorField key={i} label={`${i} ${name}`} value={colors[i]} onChange={(v) => updateColor(i, v)} />
        ))}
      </div>
    </div>
  )
}

export default CirclePianoDemo
