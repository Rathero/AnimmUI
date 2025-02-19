import { Plus, Minus } from "lucide-react";
import { Button } from "../ui/button";

export function EditorZoom(props:any) {

    return (
        <div className="absolute right-0 bottom-0 z-50 p-4">
            <div className="flex rounded-lg bg-white border transition-shadow hover:shadow-md hover:shadow-slate-500/10 p-1 gap-4">
                <Button variant="ghost" className="h-6 w-4"
                onClick={() => props.zoomOut()}
                >
                    <Minus/>
                </Button>
                <Button variant="link" className="h-6 w-10"
                onClick={() => props.resetTransform()}
                >
                    100%
                </Button>
                <Button variant="ghost"  className="h-6 w-8"
                onClick={() => props.zoomIn()}
                >
                    <Plus/>
                </Button>
            </div>
        </div>
    );
}