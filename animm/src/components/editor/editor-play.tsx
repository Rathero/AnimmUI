import { Play } from "lucide-react";
import { Button } from "../ui/button";

export function EditorPlay(props:any) {
    return (
        <div className="absolute -translate-x-1/2 left-1/2 bottom-0 z-50 p-4">
            <div className="flex rounded-lg bg-white border transition-shadow hover:shadow-md hover:shadow-slate-500/10 p-1">
                <Button className="[&_svg]:size-2.5 h-6 w-6 p-0">
                    <Play className=" fill-white border-"/>
                </Button>
                <Button variant="link" className="h-6 w-16">
                    Pause
                </Button>
            </div>
        </div>
    );
}