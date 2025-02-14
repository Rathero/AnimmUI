import { HeaderPage } from "@/components/header-page";

export default function Home() {
  return (
    <div className="h-full flex flex-col gap-4">
    <HeaderPage 
    title="Home"
    desc="Your homePage"
    />
    <div className="w-full flex flex-wrap gap-4 p-4">

    </div>
  </div>
  );
}
