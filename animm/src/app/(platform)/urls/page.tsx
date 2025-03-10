import { HeaderPage } from '@/components/header-page';
import { Url, columns } from './url-columns';
import { DataTable } from '@/components/table/data-table';

async function getData(): Promise<Url[]> {
  return [
    {
      id: '1',
      name: 'PixelCraft',
      templateId: 23,
      url: 'www.creativehub.com/pixelcraft',
      enabled: true,
      date: '2024-03-12',
    },
    {
      id: '2',
      name: 'VisionaryGrid',
      templateId: 45,
      url: 'www.designverse.com/visionary-grid',
      enabled: false,
      date: '2024-07-05',
    },
    {
      id: '3',
      name: 'NeonBlueprint',
      templateId: 12,
      url: 'www.innovate.io/neon-blueprint',
      enabled: true,
      date: '2024-09-18',
    },
    {
      id: '4',
      name: 'CyberDraft',
      templateId: 67,
      url: 'www.digitalsketch.com/cyberdraft',
      enabled: false,
      date: '2024-06-22',
    },
    {
      id: '5',
      name: 'FuturistFlow',
      templateId: 33,
      url: 'www.ultradesign.net/futurist-flow',
      enabled: true,
      date: '2024-01-10',
    },
    {
      id: '6',
      name: 'EcoInterface',
      templateId: 56,
      url: 'www.greenui.com/eco-interface',
      enabled: false,
      date: '2024-04-07',
    },
    {
      id: '7',
      name: 'DarkMatterUI',
      templateId: 77,
      url: 'www.nexuslab.io/darkmatter-ui',
      enabled: true,
      date: '2024-12-15',
    },
    {
      id: '8',
      name: 'MetaSculpt',
      templateId: 29,
      url: 'www.aetherdesigns.com/meta-sculpt',
      enabled: false,
      date: '2024-08-02',
    },
    {
      id: '9',
      name: 'ZenBlocks',
      templateId: 14,
      url: 'www.minimalhub.com/zen-blocks',
      enabled: true,
      date: '2024-05-26',
    },
    {
      id: '10',
      name: 'DreamWeave',
      templateId: 39,
      url: 'www.inspiro.com/dreamweave',
      enabled: true,
      date: '2024-11-21',
    },
    {
      id: '11',
      name: 'QuantumFrame',
      templateId: 52,
      url: 'www.dimensiondesigns.com/quantum-frame',
      enabled: false,
      date: '2024-10-09',
    },
    {
      id: '12',
      name: 'NeuroSketch',
      templateId: 18,
      url: 'www.brainwaveui.com/neuro-sketch',
      enabled: true,
      date: '2024-02-14',
    },
    {
      id: '13',
      name: 'FlowSync',
      templateId: 61,
      url: 'www.motionlab.com/flowsync',
      enabled: false,
      date: '2024-07-30',
    },
    {
      id: '14',
      name: 'PixelWeave',
      templateId: 22,
      url: 'www.dreamdesigns.io/pixel-weave',
      enabled: true,
      date: '2024-06-03',
    },
    {
      id: '15',
      name: 'SynthCraft',
      templateId: 47,
      url: 'www.futuristicui.com/synth-craft',
      enabled: false,
      date: '2024-09-27',
    },
    {
      id: '16',
      name: 'VisionaryX',
      templateId: 36,
      url: 'www.designnext.com/visionary-x',
      enabled: true,
      date: '2024-01-11',
    },
    {
      id: '17',
      name: 'HyperLoop',
      templateId: 58,
      url: 'www.interfacelab.com/hyperloop',
      enabled: false,
      date: '2024-03-17',
    },
    {
      id: '18',
      name: 'NeoGrid',
      templateId: 25,
      url: 'www.modernui.com/neo-grid',
      enabled: true,
      date: '2024-05-05',
    },
    {
      id: '19',
      name: 'AstroForge',
      templateId: 66,
      url: 'www.spacelab.io/astroforge',
      enabled: false,
      date: '2024-08-29',
    },
    {
      id: '20',
      name: 'EtherealVision',
      templateId: 44,
      url: 'www.cloudux.com/ethereal-vision',
      enabled: true,
      date: '2024-12-13',
    },
    {
      id: '21',
      name: 'LiquidGrid',
      templateId: 31,
      url: 'www.fluidui.com/liquid-grid',
      enabled: false,
      date: '2024-04-09',
    },
    {
      id: '22',
      name: 'NovaWeave',
      templateId: 72,
      url: 'www.stellarux.com/nova-weave',
      enabled: true,
      date: '2024-06-25',
    },
    {
      id: '23',
      name: 'ChronoCraft',
      templateId: 53,
      url: 'www.timedesign.io/chrono-craft',
      enabled: false,
      date: '2024-07-19',
    },
    {
      id: '24',
      name: 'ShadowUI',
      templateId: 60,
      url: 'www.darkmode.com/shadow-ui',
      enabled: true,
      date: '2024-10-07',
    },
    {
      id: '25',
      name: 'HorizonMatrix',
      templateId: 21,
      url: 'www.nextgenui.com/horizon-matrix',
      enabled: false,
      date: '2024-02-01',
    },
  ];
}

export default async function UrlsPage() {
  const data = await getData();
  return (
    <div className="h-full flex flex-col gap-4">
      <HeaderPage title="Urls" desc="You can find your generated Urls" />
      <div className="w-full p-4">
        <DataTable columns={columns} data={data} />
      </div>
    </div>
  );
}
