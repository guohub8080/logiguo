import { useState } from "react";
import OctavePiano, { type KeyConfig } from "@music-comps/OctavePiano";
import NoteText from "@music-comps/NoteText/NoteText.tsx";
import { getNoteByPianoKeyId } from "music12";
import { Card, CardContent, CardHeader, CardTitle } from "@shadcn/components/ui/card";
import { Slider } from "@shadcn/components/ui/slider";
import { Switch } from "@shadcn/components/ui/switch";
import { Button } from "@shadcn/components/ui/button";
import { Separator } from "@shadcn/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@shadcn/components/ui/popover";
import { HexColorPicker } from "react-colorful";

const defaultConfig = {
  whiteKeyWidth: 40,
  whiteKeyHeight: 120,
  blackKeyWidthRatio: 0.7,
  blackKeyHeightRatio: 0.6,
  whiteKeyBorderWidth: 2,
  blackKeyBorderWidth: 2,
  whiteKeyGap: 0,
  whiteKeyRadius: 8,
  blackKeyRadius: 4,
  defaultBlackKeyColor: "#333333",
  defaultWhiteKeyColor: "#ffffff",
  defaultBlackKeyBorderColor: "#444444",
  defaultWhiteKeyBorderColor: "#444444",
  defaultWhiteKeyHoverColor: "#e5e7eb",
  defaultBlackKeyHoverColor: "#555555",
};

function SliderField({ label, value, min, max, step, onChange }: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-sm font-mono w-12 text-right">{value}</span>
      </div>
      <Slider
        min={min} max={max} step={step}
        value={[value]}
        onValueChange={([v]) => onChange(v)}
      />
    </div>
  );
}

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

export default function PianoDemo() {
  const [config, setConfig] = useState(defaultConfig);
  const [pureDisplay, setPureDisplay] = useState(false);
  const [showKeyNote, setShowKeyNote] = useState(false);
  const [lastClick, setLastClick] = useState<number | null>(null);

  const update = <K extends keyof typeof config>(key: K, val: (typeof config)[K]) => {
    setConfig((prev) => ({ ...prev, [key]: val }));
  };

  const reset = () => {
    setConfig(defaultConfig);
    setPureDisplay(false);
    setShowKeyNote(false);
    setLastClick(null);
  };

  const isBlack = (i: number) => [1, 3, 6, 8, 10].includes(i);

  const handleClick = (i: number) => {
    setLastClick(i);
  };

  const activeBgColor = (i: number) =>
    i === lastClick ? (isBlack(i) ? '#4ade80' : '#86efac') : undefined;

  const keys: KeyConfig[] = Array.from({ length: 12 }, (_, i) => {
    const bgColor = activeBgColor(i);
    const key: KeyConfig = {
      bgColor,
      hoverColor: (pianoKeyId) => {
        if (pianoKeyId === lastClick && isBlack(pianoKeyId)) return '#22c55e';
        if (pianoKeyId === lastClick && !isBlack(pianoKeyId)) return '#4ade80';
        return undefined as unknown as string;
      },
    };
    if (showKeyNote) {
      if (isBlack(i)) {
        const notes = getNoteByPianoKeyId(i);
        key.node = (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
            {notes.map((n, ni) => (
              <div key={ni} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 20, height: 20, borderRadius: '50%',
                backgroundColor: ni === 0 ? '#fb923c' : '#60a5fa',
              }}>
                <NoteText step={n.step} alter={n.alter} fontSize={8} color="#fff" />
              </div>
            ))}
          </div>
        );
      } else {
        const n = getNoteByPianoKeyId(i)[0];
        key.node = <NoteText step={n.step} alter={n.alter} fontSize={12} color="#555" />;
      }
    }
    return key;
  });

  const {
    whiteKeyWidth, whiteKeyHeight,
    blackKeyWidthRatio, blackKeyHeightRatio,
    whiteKeyBorderWidth, blackKeyBorderWidth,
    whiteKeyGap, whiteKeyRadius, blackKeyRadius,
    defaultBlackKeyColor, defaultWhiteKeyColor,
    defaultBlackKeyBorderColor, defaultWhiteKeyBorderColor,
    defaultWhiteKeyHoverColor, defaultBlackKeyHoverColor,
  } = config;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-center">
        <OctavePiano
          keys={keys}
          config={{
            ...config,
            whiteKeyBorderRadius: Array.from({ length: 7 }, () => ({ tl: 0, tr: 0, bl: whiteKeyRadius, br: whiteKeyRadius })),
            blackKeyBorderRadius: Array.from({ length: 6 }, () => ({ tl: 0, tr: 0, bl: blackKeyRadius, br: blackKeyRadius })),
          }}
          isPureDisplay={pureDisplay}
          onClick={handleClick}
        />
      </div>

      {!pureDisplay && (
        <div className="flex items-center justify-center h-8">
          {lastClick !== null && getNoteByPianoKeyId(lastClick).flatMap((n, i, arr) => (
            i < arr.length - 1
              ? [<NoteText key={i} step={n.step} alter={n.alter} fontSize={20} />, <span key={`s${i}`} className="text-muted-foreground">/</span>]
              : <NoteText key={i} step={n.step} alter={n.alter} fontSize={20} />
          ))}
        </div>
      )}

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">配置面板</CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">音名</span>
                <Switch checked={showKeyNote} onCheckedChange={setShowKeyNote} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">纯展示</span>
                <Switch checked={pureDisplay} onCheckedChange={setPureDisplay} />
              </div>
              <Button variant="outline" size="sm" onClick={reset}>重置</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SliderField label="白键宽度" value={whiteKeyWidth} min={20} max={80} step={1}
              onChange={(v) => update("whiteKeyWidth", v)} />
            <SliderField label="白键高度" value={whiteKeyHeight} min={60} max={240} step={2}
              onChange={(v) => update("whiteKeyHeight", v)} />
            <SliderField label="黑键宽度比" value={blackKeyWidthRatio} min={0.3} max={1} step={0.05}
              onChange={(v) => update("blackKeyWidthRatio", v)} />
            <SliderField label="黑键高度比" value={blackKeyHeightRatio} min={0.3} max={0.9} step={0.05}
              onChange={(v) => update("blackKeyHeightRatio", v)} />
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SliderField label="白键边框" value={whiteKeyBorderWidth} min={0} max={4} step={0.5}
              onChange={(v) => update("whiteKeyBorderWidth", v)} />
            <SliderField label="黑键边框" value={blackKeyBorderWidth} min={0} max={4} step={0.5}
              onChange={(v) => update("blackKeyBorderWidth", v)} />
            <SliderField label="白键间距" value={whiteKeyGap} min={0} max={8} step={1}
              onChange={(v) => update("whiteKeyGap", v)} />
            <SliderField label="白键圆角" value={whiteKeyRadius} min={0} max={20} step={1}
              onChange={(v) => update("whiteKeyRadius", v)} />
            <SliderField label="黑键圆角" value={blackKeyRadius} min={0} max={12} step={1}
              onChange={(v) => update("blackKeyRadius", v)} />
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ColorField label="白键颜色" value={defaultWhiteKeyColor}
              onChange={(v) => update("defaultWhiteKeyColor", v)} />
            <ColorField label="黑键颜色" value={defaultBlackKeyColor}
              onChange={(v) => update("defaultBlackKeyColor", v)} />
            <ColorField label="白键边框色" value={defaultWhiteKeyBorderColor}
              onChange={(v) => update("defaultWhiteKeyBorderColor", v)} />
            <ColorField label="黑键边框色" value={defaultBlackKeyBorderColor}
              onChange={(v) => update("defaultBlackKeyBorderColor", v)} />
            <ColorField label="白键悬停色" value={defaultWhiteKeyHoverColor}
              onChange={(v) => update("defaultWhiteKeyHoverColor", v)} />
            <ColorField label="黑键悬停色" value={defaultBlackKeyHoverColor}
              onChange={(v) => update("defaultBlackKeyHoverColor", v)} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
