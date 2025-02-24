import Image from "next/image"
import { Folder, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function CardElement(props: any) {
  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg hover:shadow-slate-500/10">
      <CardHeader className="p-0">
        <div className="relative w-full h-44 md:h-36">
          <Image src={props.temp.img} alt="Template cover" layout="fill" objectFit="cover" />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex justify-between items-center gap-3">
          <div className="flex gap-4 items-center">
            <div>
              <div className="rounded-md border p-3">
                <Folder className="w-5 h-5 text-muted-foreground/70" />
              </div>
            </div>
            <div>
              <h3 className="text-md font-medium tracking-normal line-clamp-1">{props.temp.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-1">{props.temp.type} · {props.temp.extra}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-4">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuItem>Duplicate</DropdownMenuItem>
              <DropdownMenuItem>Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )
}