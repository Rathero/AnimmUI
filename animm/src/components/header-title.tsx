'use client';

import { platformStore } from '@/stores/platformStore';

export function HeaderTitle() {
  const pageTitle = platformStore(state => state.pageTitle);

  if (!pageTitle) return null;

  return <h1 className="text-xl font-semibold">{pageTitle}</h1>;
}
