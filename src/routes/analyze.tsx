import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { MobileFrame } from "@/components/MobileFrame";
import { BottomNav } from "@/components/BottomNav";
import { APARTMENTS } from "@/lib/apartments-data";

type Search = { id?: string; source?: "home" | "find" };

export const Route = createFileRoute("/analyze")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    id: typeof s.id === "string" ? s.id : "mapo-raemian",
    source: s.source === "find" ? "find" : "home",
  }),
  component: Analyze,
});

const STEPS = ["주소 확인", "주변 시설 검색", "도보 시간 계산", "생활권 분석 완료"];

function Analyze() {
  const { id = "mapo-raemian", source = "home" } = Route.useSearch();
  const navigate = useNavigate();
  const apt = APARTMENTS.find((a) => a.id === id) ?? APARTMENTS[0];
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 1; i <= STEPS.length; i++) {
      timers.push(setTimeout(() => setStep(i), i * 550));
    }
    timers.push(
      setTimeout(
        () => {
          navigate({
            to: "/apartment/$id",
            params: { id: apt.id },
            search: { minutes: 15, facilities: "subway,daiso,oliveyoung,mart", source },
          });
        },
        STEPS.length * 550 + 500,
      ),
    );
    return () => timers.forEach(clearTimeout);
  }, [apt.id, navigate, source]);

  return (
    <MobileFrame>
      <div className="min-h-screen flex flex-col px-6 pt-24 pb-16">
        <div className="text-[13px] text-muted-foreground">{apt.name}</div>
        <h1 className="mt-2 text-[24px] font-bold tracking-tight leading-snug">
          생활권을 분석하고 있어요
        </h1>
        <p className="mt-3 text-[14px] text-muted-foreground leading-relaxed">
          주변 지하철, 다이소, 올리브영,
          <br />
          대형마트까지 걸리는 시간을 확인 중입니다.
        </p>

        <div className="mt-12 space-y-3">
          {STEPS.map((label, i) => {
            const done = i < step;
            const active = i === step;
            return (
              <div
                key={label}
                className={
                  "flex items-center gap-3 rounded-2xl border px-4 py-3.5 transition " +
                  (done
                    ? "bg-accent border-accent"
                    : active
                      ? "bg-card border-primary/40"
                      : "bg-card border-border opacity-50")
                }
              >
                <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-background">
                  {done ? (
                    <Check size={14} className="text-primary" strokeWidth={3} />
                  ) : active ? (
                    <Loader2 size={14} className="text-primary animate-spin" strokeWidth={2.5} />
                  ) : (
                    <span className="text-[11px] text-muted-foreground font-semibold">{i + 1}</span>
                  )}
                </div>
                <span
                  className={
                    "text-[14px] " +
                    (done || active ? "font-semibold text-foreground" : "text-muted-foreground")
                  }
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <BottomNav />
    </MobileFrame>
  );
}
