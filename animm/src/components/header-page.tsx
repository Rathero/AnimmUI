import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeaderPage(props:any) {
    return (
        <div className="w-full flex flex-row p-4 pb-8 border-b">
          <div className="w-full space-y-2">
            <h1 className="scroll-m-20 text-3xl font-bold tracking-tight">
                {props.title}
            </h1>
            <p className="text-base text-muted-foreground">
                {props.desc}
            </p>
          </div>
        </div>
    );
}