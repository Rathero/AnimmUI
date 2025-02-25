import { HeaderPage } from '@/components/header-page';
import TemplateElement from '@/components/template-card';

import { collectionsService } from '@/app/services/CollectionsService';

export default async function CollectionPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;

  const collection = await collectionsService.get(id);
  if (!collection) return <></>;
  return (
    <div className="h-full flex flex-col gap-4">
      <HeaderPage
        title={collection.Result.name}
        desc={collection.Result.description}
      />
      <div className="w-full grid grid-cols-1 2xl:grid-cols-5 xl:grid-cols-4 lg:grid-cols-3 sm:grid-cols-2 gap-4 p-4">
        {collection.Result.templates.map(template => (
          <TemplateElement key={template.id} template={template} />
        ))}
      </div>
    </div>
  );
}
