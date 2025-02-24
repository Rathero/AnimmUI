import { Play, Pause } from "lucide-react";
import { Button } from "../ui/button";
import { Dispatch, SetStateAction } from "react";

export function EditorPlay(props: { playRive: () => void; playing: boolean }) {
  return (
    <div className="absolute -translate-x-1/2 left-1/2 bottom-0 z-50 p-4">
      <Button
        variant="ghost"
        className="flex rounded-lg bg-white border transition-shadow hover:shadow-md hover:shadow-slate-500/10 p-1 gap-0"
        onClick={() => props.playRive()}
      >
        <div className="h-full aspect-square grid bg-black rounded-md items-center justify-center">
          {props.playing ? (
            <Pause className="fill-white border-" />
          ) : (
            <Play className="fill-white border-" />
          )}
        </div>
        <p className="w-16">{props.playing ? "Pause" : "Play"}</p>
      </Button>
    </div>
  );
}
