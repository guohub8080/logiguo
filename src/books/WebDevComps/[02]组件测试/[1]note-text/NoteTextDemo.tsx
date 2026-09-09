/** @jsxImportSource @emotion/react */
import { useState } from "react";
import NoteText, { type NotationMode } from "@music-comps/NoteText/NoteText.tsx";
import BlankNoteText from "@music-comps/NoteText/BlankNoteText.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "@shadcn/components/ui/card";
import { Slider } from "@shadcn/components/ui/slider";
import { Switch } from "@shadcn/components/ui/switch";
import { Button } from "@shadcn/components/ui/button";
import { Separator } from "@shadcn/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@shadcn/components/ui/popover";
import { HexColorPicker } from "react-colorful";

const STEPS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const ALTERS = [
  { label: '♭♭', value: -2 },
  { label: '♭', value: -1 },
  { label: '♮', value: 0 },
  { label: '#', value: 1 },
  { label: '×', value: 2 },
];
const NOTATIONS: { value: NotationMode; label: string }[] = [
  { value: 'upper', label: 'C D E' },
  { value: 'lower', label: 'c d e' },
  { value: 'roman-upper', label: 'I II III' },
  { value: 'roman-lower', label: 'i ii iii' },
  { value: 'arabic', label: '1 2 3' },
];

function ColorField({ label, value, onChange }: {
  label: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <Popover>
        <PopoverTrigger asChild>
          <button className="flex items-center gap-2 rounded-md border px-2 py-1 hover:bg-accent transition">
            <div className="w-5 h-5 rounded-sm border" style={{ backgroundColor: value }} />
            <span className="text-xs font-mono">{value}</span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3" align="end">
          <HexColorPicker color={value} onChange={onChange} />
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default function NoteTextDemo() {
  const [step, setStep] = useState('C');
  const [alter, setAlter] = useState(1);
  const [fontSize, setFontSize] = useState(24);
  const [isNatural, setIsNatural] = useState(false);
  const [color, setColor] = useState('#1a1a1a');
  const [notation, setNotation] = useState<NotationMode>('upper');
  const [serif, setSerif] = useState(false);

  const reset = () => {
    setStep('C');
    setAlter(1);
    setFontSize(24);
    setIsNatural(false);
    setColor('#1a1a1a');
    setNotation('upper');
    setSerif(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end gap-6 justify-center py-4">
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs text-muted-foreground">NoteText</span>
          <NoteText step={step} alter={alter} fontSize={fontSize} isNatural={isNatural} color={color} notation={notation} serif={serif} />
        </div>
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs text-muted-foreground">BlankNoteText</span>
          <BlankNoteText fontSize={fontSize} color={color} />
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">配置面板</CardTitle>
            <Button variant="outline" size="sm" onClick={reset}>重置</Button>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-sm text-muted-foreground">记谱法 (notation)</span>
            <div className="flex gap-1 flex-wrap">
              {NOTATIONS.map(n => (
                <button key={n.value}
                  className={`px-3 py-1 rounded text-sm ${notation === n.value ? 'bg-primary text-primary-foreground' : 'border hover:bg-accent'}`}
                  onClick={() => setNotation(n.value)}>
                  {n.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-sm text-muted-foreground">音名 (step)</span>
            <div className="flex gap-1">
              {STEPS.map(s => (
                <button key={s}
                  className={`px-3 py-1 rounded text-sm font-mono ${step === s ? 'bg-primary text-primary-foreground' : 'border hover:bg-accent'}`}
                  onClick={() => setStep(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-sm text-muted-foreground">变化音 (alter)</span>
            <div className="flex gap-1">
              {ALTERS.map(a => (
                <button key={a.value}
                  className={`px-3 py-1 rounded text-sm ${alter === a.value ? 'bg-primary text-primary-foreground' : 'border hover:bg-accent'}`}
                  onClick={() => setAlter(a.value)}>
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          <Separator />

          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground shrink-0">字号</span>
            <span className="text-sm font-mono w-6 text-right shrink-0">{fontSize}</span>
            <Slider min={10} max={64} step={1} value={[fontSize]} onValueChange={([v]) => setFontSize(v)} className="flex-1" />
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">还原号</span>
              <Switch checked={isNatural} onCheckedChange={setIsNatural} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">衬线</span>
              <Switch checked={serif} onCheckedChange={setSerif} />
            </div>
          </div>

          <Separator />

          <ColorField label="颜色" value={color} onChange={setColor} />
        </CardContent>
      </Card>
    </div>
  );
}
