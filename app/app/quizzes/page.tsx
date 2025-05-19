"use client";

import { LoginSection } from "@/components/login-section";
import { QuizzesSection } from "@/components/quizzes/quizzes-section";
import { useCurrentAccount } from "@mysten/dapp-kit";

export default function QuizzesPage() {
  const account = useCurrentAccount();

  if (account) {
    return <QuizzesSection />;
  }

  return <LoginSection />;
}
