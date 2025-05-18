"use client";

import { LoginSection } from "@/components/login-section";
import { QuizSection } from "@/components/quizzes/quiz-section";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useParams } from "next/navigation";

export default function QuizPage() {
  const { id } = useParams();
  const account = useCurrentAccount();

  if (account) {
    return <QuizSection id={id as string} />;
  }

  return <LoginSection />;
}
