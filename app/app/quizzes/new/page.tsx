"use client";

import { LoginSection } from "@/components/login-section";
import { NewQuizSection } from "@/components/quizzes/new-quiz-section";
import { useCurrentAccount } from "@mysten/dapp-kit";

export default function NewQuizPage() {
  const account = useCurrentAccount();

  if (account) {
    return <NewQuizSection />;
  }

  return <LoginSection />;
}
