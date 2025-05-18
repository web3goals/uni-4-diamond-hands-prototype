import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="container mx-auto min-h-[80vh] flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 px-4 py-4">
      <div className="max-w-xl">
        <Image
          src="/images/cover.png"
          alt="Cover"
          priority={false}
          width="100"
          height="100"
          sizes="100vw"
          className="w-full rounded-xl"
        />
      </div>
      <div className="max-w-md">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter">
          Quiz, Win, HODL: Turn Coin Holders into Diamond Hands!
        </h1>
        <p className="font-medium tracking-tight text-muted-foreground mt-2">
          A UNI-powered platform to create quizzes that turn your project&apos;s
          coin holders into diamond-handed supporters
        </p>
        <div className="flex flex-row gap-2 mt-4">
          <Link href="/quizzes/new">
            <Button>
              <PlusIcon /> Create quiz
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
