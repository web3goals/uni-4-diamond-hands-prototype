"use client";

import { ConnectButton } from "@mysten/dapp-kit";

export function LoginSection() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[80vh] mx-auto px-4 py-4">
      <h1 className="text-3xl font-semibold tracking-tight">
        Please connect wallet to continue
      </h1>
      <div className="mt-4">
        <ConnectButton />
      </div>
    </main>
  );
}
