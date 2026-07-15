import type { ReactNode } from "react";

export function MobileFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-muted/40 flex justify-center">
      <div className="w-full max-w-[430px] min-h-screen bg-background relative shadow-sm">
        {children}
      </div>
    </div>
  );
}
