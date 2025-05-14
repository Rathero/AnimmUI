import React, { useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';

import marketsJson from '../data/Markets.json';
import productsJson from '../data/Products.json';
import { Button } from '@/components/ui/button';

const iText = (
  <IconTextScan2 style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
);

// const ProductSelector = ({ template }: { template: number }) => {
const ProductSelector = () => {
  const router = useRouter();
  const params = useParams();
  const [market, setMarket] = useState<string | null>(null);
  const [product, setProduct] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const client = searchParams.get('client');

  const url: string =
    '/templates/' +
    params.id +
    '?product=' +
    product +
    '&market=' +
    market +
    '&client=' +
    client;

  const products = productsJson;
  const CatProducts = products.map((product: any) => {
    return {
      value: '' + product.id,
      label: product.title.es,
    };
  });
  const CatMarkets = marketsJson.map((market: any) => {
    return {
      value: market.id,
      label: market.name,
    };
  });

  const campaignses = [
    {
      value: 'BLACK FRIDAY',
      label: 'BLACK FRIDAY',
    },
    {
      value: 'FLOWER POWER',
      label: 'FLOWER POWER',
    },
    {
      value: 'OFERTA DEL DIA',
      label: 'OFERTA DEL DIA',
    },
  ];
  const campaignsde = [
    {
      value: 'BLACK FRIDAY',
      label: 'BLACK FRIDAY',
    },
    {
      value: 'FLOWER POWER',
      label: 'FLOWER POWER',
    },
    {
      value: 'OFERTA DEL DIA',
      label: 'OFERTA DEL DIA',
    },
  ];
  const campaignsen = [
    {
      value: 'BLACK FRIDAY',
      label: 'BLACK FRIDAY',
    },
    {
      value: 'FLOWER POWER',
      label: 'FLOWER POWER',
    },
    {
      value: 'OFERTA DEL DIA',
      label: 'OFERTA DEL DIA',
    },
  ];

  return (
    <div
      className={
        'overflow-hidden relative border bg-white mb-6 ' +
        (params.id != '0' ? 'border-stone-200' : ' border-black')
      }
    >
      <div className="px-4 py-5">
        <h3 className="block mb-6 text-xl font-thin uppercase text-black">
          1. Product search
        </h3>
        <div className="grid gap-y-2">
          <Select
            label="Market"
            placeholder="Select Market"
            checkIconPosition="right"
            data={CatMarkets}
            searchable
            nothingFoundMessage="Nothing found..."
            onChange={setMarket}
          />
          <Select
            label="Product"
            placeholder="Select product"
            checkIconPosition="right"
            data={CatProducts}
            searchable
            nothingFoundMessage="Nothing found..."
            onChange={setProduct}
          />
        </div>
      </div>
      <Button
        color="rgba(0, 0, 0, 1)"
        style={{ width: 100 + '%', fontWeight: 400 }}
        className="uppercase"
        onClick={() => {
          router.push(url);
        }}
        disabled={market && product ? false : true}
      >
        Update{' '}
      </Button>
    </div>
  );
};

export default ProductSelector;
