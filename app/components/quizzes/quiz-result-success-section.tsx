import { Button } from "@/components/ui/button";
import { QuizMetadata } from "@/types/quiz-metadata";
import { SquareArrowOutUpRightIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import Confetti from "react-confetti";

export function QuizResultSuccessSection(props: {
  metadata: QuizMetadata;
  txBlock: string;
}) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="container mx-auto min-h-[80vh] flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 px-4 py-4">
      <div className="max-w-xl">
        <Image
          src="/images/success.png"
          alt="Success"
          priority={false}
          width="100"
          height="100"
          sizes="100vw"
          className="w-full rounded-xl"
        />
      </div>
      <div className="max-w-md">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter">
          Congratulations!
        </h1>
        <p className="font-medium tracking-tight text-muted-foreground mt-2">
          You successfully passed the quiz about {props.metadata.projectTitle}{" "}
          and got {props.metadata.passReward / 1_000_000} UNI coins
        </p>
        <p className="font-medium tracking-tight text-muted-foreground mt-2">
          Do not sell your {props.metadata.projectCoin.split("::").at(-1)} coins
          for 30 days and get extra {props.metadata.holdReward / 1_000_000} UNI
          coins
        </p>
        <div className="flex flex-row gap-2 mt-4">
          <Link
            href={`https://testnet.suivision.xyz/txblock/${props.txBlock}`}
            target="_blank"
          >
            <Button>
              <SquareArrowOutUpRightIcon />
              Open transaction
            </Button>
          </Link>
        </div>
        <Confetti
          width={document.body.clientWidth}
          height={document.body.scrollHeight}
          recycle={false}
        />
      </div>
    </main>
  );
}
