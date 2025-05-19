import useError from "@/hooks/use-error";
import { ipfsToHttp } from "@/lib/ipfs";
import { QuizMetadata } from "@/types/quiz-metadata";
import { useSuiClient } from "@mysten/dapp-kit";
import axios from "axios";
import {
  CalendarIcon,
  CoinsIcon,
  GemIcon,
  LinkIcon,
  PiggyBankIcon,
  SparkleIcon,
  SparklesIcon,
  SquareArrowOutUpRightIcon,
  TextIcon,
  UsersRoundIcon,
  WalletIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";

export function QuizCard(props: { id: string }) {
  const { handleError } = useError();
  const client = useSuiClient();
  const [balance, setBalance] = useState<string | undefined>();
  const [metadata, setMetadata] = useState<QuizMetadata | undefined>();
  const [passedUsers, setPassedUsers] = useState<string[]>([]);

  async function loadQuiz() {
    try {
      console.log("Loading quiz object...");
      const quizObject = await client.getObject({
        id: props.id,
        options: {
          showContent: true,
        },
      });
      let quizBalance: string | undefined;
      let quizPassedUsers: string[] = [];
      let quizObjectUrl: string | undefined;
      if (quizObject.data?.content?.dataType === "moveObject") {
        const fields = quizObject.data.content.fields;
        // Extract balance from the balance field
        quizBalance =
          typeof fields === "object" && "balance" in fields
            ? (fields.balance as string)
            : undefined;
        // Extract passed users from the passed_users field
        if (typeof fields === "object" && "passed_users" in fields) {
          const passedUsersMap = fields.passed_users as {
            fields?: {
              contents?: Array<{
                fields?: {
                  key?: string;
                  value?: boolean;
                };
                type?: string;
              }>;
            };
            type?: string;
          };
          if (passedUsersMap?.fields?.contents) {
            quizPassedUsers = passedUsersMap.fields.contents
              .filter((entry) => entry?.fields?.value === true)
              .map((entry) => entry?.fields?.key || "")
              .filter((address) => address !== "");
          }
        }
        // Extract quiz object URL from the url field
        quizObjectUrl =
          typeof fields === "object" && "url" in fields
            ? (fields.url as string)
            : undefined;
      }
      if (!quizBalance || !quizPassedUsers || !quizObjectUrl) {
        throw new Error("Quiz data not found");
      }
      setBalance(quizBalance);
      setPassedUsers(quizPassedUsers);

      console.log("Loading quiz metadata...");
      const { data } = await axios.get(ipfsToHttp(quizObjectUrl));
      setMetadata(data);
    } catch (error) {
      handleError(error, "Failed to load quiz, please try again");
    }
  }

  useEffect(() => {
    loadQuiz();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.id]);

  if (!metadata) {
    return <Skeleton className="h-8" />;
  }

  return (
    <div className="w-full flex flex-row gap-6 border rounded px-6 py-6">
      {/* Left part */}
      <div className="w-36">
        {/* Image */}
        <Image
          src="/images/card.png"
          alt="Card"
          priority={false}
          width="100"
          height="100"
          sizes="100vw"
          className="w-full rounded-xl"
        />
      </div>
      {/* Right part */}
      <div className="flex-1">
        {/* Name */}
        <p className="text-xl font-extrabold">{metadata.name}</p>
        {/* Params */}
        <div className="flex flex-col gap-4 mt-4">
          {/* Description */}
          <div className="flex flex-row gap-3">
            <div className="flex items-center justify-center size-8 rounded-full bg-primary">
              <TextIcon className="size-4 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Description</p>
              <p className="text-sm">{metadata.description}</p>
            </div>
          </div>
          {/* Created */}
          <div className="flex flex-row gap-3">
            <div className="flex items-center justify-center size-8 rounded-full bg-primary">
              <CalendarIcon className="size-4 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="text-sm">
                {new Date(metadata.created).toLocaleString()}
              </p>
            </div>
          </div>
          {/* Project links */}
          <div className="flex flex-row gap-3">
            <div className="flex items-center justify-center size-8 rounded-full bg-primary">
              <LinkIcon className="size-4 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Project links</p>
              <div className="flex flex-col gap-1">
                {metadata.projectLinks.map((link, index) => (
                  <Link key={index} href={link} target="_blank">
                    <p className="text-sm underline underline-offset-4">
                      {link}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
          {/* Project coin */}
          <div className="flex flex-row gap-3">
            <div className="flex items-center justify-center size-8 rounded-full bg-primary">
              <CoinsIcon className="size-4 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Project coin</p>
              <Link
                href={`https://testnet.suivision.xyz/coin/${metadata.projectCoin}`}
                target="_blank"
              >
                <p className="text-sm underline underline-offset-4 break-all">
                  {metadata.projectCoin}
                </p>
              </Link>
            </div>
          </div>
          {/* Min project coins */}
          <div className="flex flex-row gap-3">
            <div className="flex items-center justify-center size-8 rounded-full bg-primary">
              <WalletIcon className="size-4 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">
                Minimum number of project coins to pass the quiz
              </p>
              <p className="text-sm">
                {metadata.minProjectCoins / 1_000_000}{" "}
                {metadata.projectCoin.split("::").at(-1)}
              </p>
            </div>
          </div>
          {/* Pass reward */}
          <div className="flex flex-row gap-3">
            <div className="flex items-center justify-center size-8 rounded-full bg-primary">
              <SparkleIcon className="size-4 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">
                Number of UNI coins for passing the quiz
              </p>
              <p className="text-sm">{metadata.passReward / 1_000_000} UNI</p>
            </div>
          </div>
          {/* Hold reward */}
          <div className="flex flex-row gap-3">
            <div className="flex items-center justify-center size-8 rounded-full bg-primary">
              <SparklesIcon className="size-4 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">
                Number of UNI coins for holding the project coins for 30 days
                after passing the quiz
              </p>
              <p className="text-sm">{metadata.holdReward / 1_000_000} UNI</p>
            </div>
          </div>
          {/* Balance */}
          <div className="flex flex-row gap-3">
            <div className="flex items-center justify-center size-8 rounded-full bg-primary">
              <PiggyBankIcon className="size-4 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Balance</p>
              <p className="text-sm">{Number(balance) / 1_000_000} UNI</p>
            </div>
          </div>
          {/* Passed users */}
          <div className="flex flex-row gap-3">
            <div className="flex items-center justify-center size-8 rounded-full bg-primary">
              <UsersRoundIcon className="size-4 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Passed users</p>
              {passedUsers.length === 0 ? (
                <p className="text-sm">No users</p>
              ) : (
                <div className="flex flex-col gap-1">
                  {passedUsers.map((user, index) => (
                    <Link
                      key={index}
                      href={`https://testnet.suivision.xyz/account/${user}`}
                      target="_blank"
                    >
                      <p className="text-sm underline underline-offset-4 break-all">
                        {user}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
          {/* Holders over 30 days */}
          <div className="flex flex-row gap-3">
            <div className="flex items-center justify-center size-8 rounded-full bg-primary">
              <GemIcon className="size-4 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">
                Holders over 30 days
              </p>
              {/* TODO: Display real data */}
              <p className="text-sm">No holders</p>
            </div>
          </div>
        </div>
        {/* Actions */}
        <div className="flex flex-row gap-2 mt-8">
          <Link href={`/quizzes/${props.id}`} target="_blank">
            <Button variant="default">
              <SquareArrowOutUpRightIcon /> Open quiz
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
