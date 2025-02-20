import { HeaderPage } from "@/components/header-page";
import TemplateElement from "@/components/template-card";

export default async function Collection({ params }: { params: { id: string } }) {
  const { id } = await params
  const col = parseInt(id)-1

  const collections = [
    {
      colId: "1",
      colTitle:"Urban Flow",
      colDesc:"A collection designed for movement and style. Minimalist silhouettes meet bold details, blending streetwear with functional design for effortless everyday wear.",
      templates:[
        {
          id: "1",
          title: "Street Essentials Lookbook",
          type: "Template",
          extra: "22/03/25",
          img: "https://ui.shadcn.com/placeholder.svg"
        },
        {
          id: "2",
          title: "Drop Collection Landing Page",
          type: "Template",
          extra: "22/03/25",
          img: "https://ui.shadcn.com/placeholder.svg"
        },
        {
          id: "3",
          title: "Social Media Hype Kit",
          type: "Template",
          extra: "22/03/25",
          img: "https://ui.shadcn.com/placeholder.svg"
        },
        {
          id: "4",
          title: "Campaign Video Overlay Pack",
          type: "Template",
          extra: "22/03/25",
          img: "https://ui.shadcn.com/placeholder.svg"
        },
        
      ]
    },
    {
      colId: "2",
      colTitle:"Timeless Essentials",
      colDesc:"Elevated basics for every wardrobe. Crafted with premium fabrics and a focus on versatility, this collection offers pieces that stand the test of time in both quality and design.",
      templates:[
        {
          id: "5",
          title: "Minimalist E-commerce Theme",
          type: "Template",
          extra: "22/03/25",
          img: "https://ui.shadcn.com/placeholder.svg"
        },
        {
          id: "6",
          title: "Lookbook & Catalog Design",
          type: "Template",
          extra: "22/03/25",
          img: "https://ui.shadcn.com/placeholder.svg"
        },
        {
          id: "7",
          title: "Branding Identity Kit",
          type: "Template",
          extra: "22/03/25",
          img: "https://ui.shadcn.com/placeholder.svg"
        },
        {
          id: "8",
          title: "Newsletter & Email Campaign",
          type: "Template",
          extra: "22/03/25",
          img: "https://ui.shadcn.com/placeholder.svg"
        }
      ]
    },
    {
      colId: "3",
      colTitle:"Future Form",
      colDesc:"Where innovation meets fashion. This collection fuses modern aesthetics with sustainable materials, redefining the future of contemporary style with eco-conscious, forward-thinking designs.",
      templates:[
        {
          id: "9",
          title: "Eco-Fashion Landing Page",
          type: "Template",
          extra: "22/03/25",
          img: "https://ui.shadcn.com/placeholder.svg"
        },
        {
          id: "10",
          title: "Techwear Lookbook & Promo Kit",
          type: "Template",
          extra: "22/03/25",
          img: "https://ui.shadcn.com/placeholder.svg"
        }
      ]
    }
  ] 

  return (
      <div className="h-full flex flex-col gap-4">
        <HeaderPage
        title={collections[col].colTitle}
        extra={collections[col].colDesc}
        />
        <div className="w-full grid grid-cols-1 2xl:grid-cols-5  xl:grid-cols-4 lg:grid-cols-3 sm:grid-cols-2 gap-4 p-4">
        {collections[col].templates.map((template) => (
          <TemplateElement key={template.id}
            id={template.id}
            img={template.img}
            title={template.title}
            type={template.type}
            extra={template.extra}
          />
        ))}
        </div>
      </div>
  );
}
