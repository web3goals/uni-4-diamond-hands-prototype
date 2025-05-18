import { Loader2Icon } from "lucide-react";

export function LoadingSection() {
  return (
    <main className="flex flex-col items-center justify-center mx-auto min-h-[80vh] px-4 py-4">
      <Loader2Icon className="animate-spin text-primary" />
    </main>
  );
}
