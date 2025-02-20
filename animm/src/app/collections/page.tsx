'use client'

import Link from "next/link";
import { usePathname } from 'next/navigation'
import { HeaderPage } from "@/components/header-page";
import CollectionCard from "@/components/collection-card";


export default function Library() {
  const pathname = usePathname()
  const collections = [
    {
      id: "1",
      title: "SUrban Flow",
      desc: "A collection designed for movement and style. Minimalist silhouettes meet bold details, blending streetwear with functional design for effortless everyday wear.",
      img: "https://ui.shadcn.com/placeholder.svg"
    },
    {
      id: "2",
      title: "Timeless Essentials",
      desc: "Elevated basics for every wardrobe. Crafted with premium fabrics and a focus on versatility, this collection offers pieces that stand the test of time in both quality and design.",
      img: "https://ui.shadcn.com/placeholder.svg"
    },
    {
      id: "3",
      title: "Future Form",
      desc: "Where innovation meets fashion. This collection fuses modern aesthetics with sustainable materials, redefining the future of contemporary style with eco-conscious, forward-thinking designs.",
      img: "https://ui.shadcn.com/placeholder.svg"
    }
  ]

  return (
      <div className="h-full flex flex-col gap-4">
        <HeaderPage
        title="Library"
        desc="Here we will display your Collections"
        />
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
        {collections.map((collection) => (
          <Link href={pathname + "/" + collection.id}
          key={collection.id}>
            <CollectionCard
              img={collection.img}
              title={collection.title}
              desc={collection.desc}
            />
          </Link>    
        ))}
        </div>
      </div>
  );
}
