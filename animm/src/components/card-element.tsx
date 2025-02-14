import Image from "next/image"
import { Folder, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function CardElement() {
  return (
    <Card className="max-w-sm overflow-hidden transition-shadow hover:shadow-md">
      <CardHeader className="p-0">
        <div className="relative w-full h-48">
          <Image src="https://ui.shadcn.com/placeholder.svg?height=192&width=384" alt="Folder cover" layout="fill" objectFit="cover" />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center rounded bg-muted/30">
              <Folder className="w-5 h-5 text-muted-foreground/70" />
            </div>
            <div>
              <h2 className="font-medium">New Collection 2025</h2>
              <p className="text-sm text-muted-foreground">Folder • 6 Files</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
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