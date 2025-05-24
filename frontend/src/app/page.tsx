import { Footer } from "@/components/Footer";
import { TextFade } from "@/components/Textfade";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-8 row-start-2 items-center text-center">
        <TextFade direction="up">
          <h1 className="text-8xl font-bold font-serif">ansel brandt</h1>
        </TextFade>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <Footer />
      </footer>
    </div>
  );
}
