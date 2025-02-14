import CardElement from "@/components/card-element";
import { HeaderPage } from "@/components/header-page";

export default function Home() {
  return (
      <div className="h-full flex flex-col gap-4">
        <HeaderPage
        title="Templates"
        desc="Here we will display your Collections"
        button="Create Collection"
        />
        <div className="w-full flex flex-wrap gap-4 p-4">
          <CardElement />
          <CardElement />
        </div>
      </div>
  );
}
