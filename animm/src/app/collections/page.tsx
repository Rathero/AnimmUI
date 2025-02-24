import Link from "next/link";
import { usePathname } from "next/navigation";
import { HeaderPage } from "@/components/header-page";
import CollectionCard from "@/components/collection-card";
import { ApiCollections } from "../../types/collections";

export default async function CollectionsPage() {
  const data = await fetch(
    "https://animmapiv2.azurewebsites.net/collections/all"
  );
  const collections: ApiCollections = await data.json();

  return (
    <div className="h-full flex flex-col gap-4">
      <HeaderPage
        title="Library"
        desc="Here we will display your Collections"
      />
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
        {collections.Result.map((collection) => (
          <Link href={"collections/" + collection.id} key={collection.id}>
            <CollectionCard collection={collection} />
          </Link>
        ))}
      </div>
    </div>
  );
}
