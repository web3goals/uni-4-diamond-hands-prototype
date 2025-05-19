import { QuizQuestion } from "@/types/quiz-question";
import { chainConfig } from "./chain";

const questions: QuizQuestion[] = [
  {
    question: "What was the total supply volume of NAVI Protocol in Q1 2025?",
    options: ["$10.5B", "$20.2B", "$30.5B", "$15.8B"],
    answer: "$30.5B",
  },
  {
    question:
      "What was the total number of transactions recorded on NAVI Protocol by Q1 2025?",
    options: ["5.2M", "8.38M+", "6.7M", "9.5M"],
    answer: "8.38M+",
  },
  {
    question:
      "How many followers did NAVI’s X.com (formerly Twitter) account reach by Q1 2025?",
    options: ["98k", "110k", "123k+", "135k"],
    answer: "123k+",
  },
];

export const demoConfig = {
  projectTitle: "NAVI Protocol",
  projectLinks:
    "https://naviprotocol.io/\nhttps://naviprotocol.gitbook.io/navi-protocol-docs/dao-and-token/2025-roadmap\nhttps://medium.com/@navi.protocol/navi-protocol-q1-2025-recap-cde6a2c0b374",
  projectCoin: `${chainConfig.navxCoinType}`,
  minProjectCoins: 1 * 1000000,
  passReward: 0.01 * 1000000,
  holdReward: 0.02 * 1000000,
  budget: 0.1 * 1000000,
  questions,
};
