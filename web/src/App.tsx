import { TopBar } from "./components/TopBar";
import { ALL_ITEMS } from "./content";
import { HorizonScanning } from "./views/HorizonScanning";

export function App() {
  return (
    <div className="min-h-screen text-neutral-900">
      <TopBar />
      <main className="max-w-[1600px] mx-auto px-5 sm:px-8 py-8">
        <HorizonScanning items={ALL_ITEMS} />
      </main>
    </div>
  );
}
