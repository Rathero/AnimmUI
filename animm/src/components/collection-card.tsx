import Image from "next/image";
import { GalleryVertical } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Collection } from "@/types/collections";

interface CollectionCardProps {
  collection: Collection;
}

export default function CollectionCard({ collection }: CollectionCardProps) {
  collection.thumbnail === ""
    ? (collection.thumbnail = "/img/placeholder.svg")
    : "";

  return (
    <Card className="flex flex-row w-full h-36 overflow-hidden transition-shadow hover:shadow-md hover:shadow-slate-500/10 cursor-pointer">
      <CardHeader className="p-0 w-72 h-full">
        <div className="relative w-full h-full">
          <Image
            src={collection.thumbnail}
            alt="Collection cover"
            priority
            fill
            style={{ objectFit: "cover" }}
          />
        </div>
      </CardHeader>
      <CardContent className="w-full p-4 ps-6 h-full">
        <div className="flex justify-between gap-6">
          <div>
            <h2 className="font-medium">{collection.name}</h2>
            <p className="text-sm line-clamp-4 text-muted-foreground">
              {collection.description}
            </p>
          </div>
          <div>
            <div className="rounded-md border border-border p-2">
              <GalleryVertical className="w-5 h-5 text-muted-foreground/70" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
