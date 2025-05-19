import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "lucide-react";
import Image from "next/image";

export function QuizResultFailSection(props: { onRestart: () => void }) {
  return (
    <main className="container mx-auto min-h-[80vh] flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 px-4 py-4">
      <div className="max-w-xl">
        <Image
          src="/images/fail.png"
          alt="Fail"
          priority={false}
          width="100"
          height="100"
          sizes="100vw"
          className="w-full rounded-xl"
        />
      </div>
      <div className="max-w-md">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter">
          Fail!
        </h1>
        <p className="font-medium tracking-tight text-muted-foreground mt-2">
          One or more of your answers were incorrect, try starting the quiz
          again
        </p>
        <div className="flex flex-row gap-2 mt-4">
          <Button onClick={props.onRestart}>
            <ArrowRightIcon />
            Start quiz again
          </Button>
        </div>
      </div>
    </main>
  );
}
