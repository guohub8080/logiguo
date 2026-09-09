import { useState } from "react";
import OctavePiano, { type KeyConfig } from "@music-comps/OctavePiano";
import NoteText from "@music-comps/NoteText/NoteText.tsx";
import { getNoteByPianoKeyId } from "music12";
import { Card, CardContent, CardHeader, CardTitle } from "@shadcn/components/ui/card";
import { Button } from "@shadcn/components/ui/button";

const octaves = [4, 5, 6];
const isBlackKey = (i: number) => [1, 3, 6, 8, 10].includes(i);

const noteStr = (pianoKeyId: number, useFlat: boolean) => {
  const notes = getNoteByPianoKeyId(pianoKeyId);
  if (!isBlackKey(pianoKeyId)) {
    const n = notes[0];
    return `${n.step}`;
  }
  const n = useFlat ? notes[1] : notes[0];
  return `${n.step}${n.alter > 0 ? '♯' : '♭'}`;
};

type SelectorState = { octave: number; pianoKeyId: number } | null;

export default function PianoEventDemo() {
  const [eventLog, setEventLog] = useState<string[]>([]);
  const [selector, setSelector] = useState<SelectorState>(null);
  const [chosen, setChosen] = useState<Record<string, 'sharp' | 'flat'>>({});

  const addLog = (msg: string) => setEventLog(prev => [...prev, msg]);

  const handleSelect = (useFlat: boolean) => {
    if (!selector) return;
    const key = `${selector.octave}-${selector.pianoKeyId}`;
    const type = useFlat ? 'flat' : 'sharp';
    setChosen(prev => ({ ...prev, [key]: type }));
    addLog(`[逐键 → 选择] 第${selector.octave}八度 ${noteStr(selector.pianoKeyId, useFlat)}`);
    addLog(`[顶层 → 使用选择] 第${selector.octave}八度 ${noteStr(selector.pianoKeyId, useFlat)}`);
    setSelector(null);
  };

  const buildKeys = (octave: number): KeyConfig[] =>
    Array.from({ length: 12 }, (_, i) => ({
      onClick: () => {
        const key = `${octave}-${i}`;
        if (isBlackKey(i)) {
          const notes = getNoteByPianoKeyId(i);
          const both = `${notes[0].step}♯/${notes[1].step}♭`;
          const chosenType = chosen[key];
          addLog(`[逐键 onClick] 第${octave}八度 ${both}（${chosenType ? '已选 ' + noteStr(i, chosenType === 'flat') : '待选择，弹出选择框'}）`);
          setSelector({ octave, pianoKeyId: i });
        } else {
          addLog(`[逐键 onClick] 第${octave}八度 ${noteStr(i, false)}`);
          setSelector(null);
        }
      },
    }));

  return (
    <div className="flex flex-col gap-6">
      <div className="overflow-x-auto">
        <div className="flex justify-center" style={{ minWidth: 650 }}>
          {octaves.map((octave, idx) => (
            <div key={octave} className="flex flex-col items-center">
              <span className="text-xs text-muted-foreground mb-1">C{octave}</span>
              <OctavePiano
                keys={buildKeys(octave)}
                config={{ whiteKeyWidth: 30, whiteKeyHeight: 100 }}
                ml={idx === 0 ? 0 : -2}
                onClick={(pianoKeyId) => {
                  const key = `${octave}-${pianoKeyId}`;
                  if (isBlackKey(pianoKeyId)) {
                    const chosenType = chosen[key];
                    const notes = getNoteByPianoKeyId(pianoKeyId);
                    const both = `${notes[0].step}♯/${notes[1].step}♭`;
                    if (chosenType) {
                      addLog(`[顶层 onClick] 第${octave}八度 使用已选：${noteStr(pianoKeyId, chosenType === 'flat')}`);
                    } else {
                      addLog(`[顶层 onClick] 第${octave}八度 尚无选择，显示：${both}`);
                    }
                  } else {
                    addLog(`[顶层 onClick] 第${octave}八度 ${noteStr(pianoKeyId, false)}`);
                  }
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {selector && (
        <div className="flex justify-center">
          <Card className="w-64">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">
                第{selector.octave}八度：选择音名
              </CardTitle>
            </CardHeader>
            <CardContent className="flex gap-3 justify-center pt-0">
              <Button
                variant="outline"
                size="sm"
                className="gap-1 px-4 py-2"
                onClick={() => handleSelect(false)}
              >
                <NoteText
                  step={getNoteByPianoKeyId(selector.pianoKeyId)[0].step}
                  alter={getNoteByPianoKeyId(selector.pianoKeyId)[0].alter}
                  fontSize={24}
                />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1 px-4 py-2"
                onClick={() => handleSelect(true)}
              >
                <NoteText
                  step={getNoteByPianoKeyId(selector.pianoKeyId)[1].step}
                  alter={getNoteByPianoKeyId(selector.pianoKeyId)[1].alter}
                  fontSize={24}
                />
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">事件日志</CardTitle>
            <Button variant="outline" size="sm" onClick={() => { setEventLog([]); setChosen({}); }}>
              清空
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 rounded-md p-3 font-mono text-xs space-y-0.5 max-h-64 overflow-y-auto">
            {eventLog.length === 0 && (
              <span className="text-muted-foreground">点击钢琴键查看事件流...</span>
            )}
            {eventLog.map((log, i) => (
              <div key={i} className={
                log.startsWith('[逐键') ? 'text-blue-500' :
                log.startsWith('[顶层') ? 'text-green-600' :
                log.startsWith('  →') ? 'text-muted-foreground' :
                'text-orange-500'
              }>
                {log}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
