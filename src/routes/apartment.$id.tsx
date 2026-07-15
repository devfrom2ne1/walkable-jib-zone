import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ChevronLeft,
  Bookmark,
  Train,
  ShoppingBag,
  Sparkles,
  Store,
  Map as MapIcon,
} from "lucide-react";
import { MobileFrame } from "@/components/MobileFrame";
import { BottomNav } from "@/components/BottomNav";
import { APARTMENTS, FACILITIES, type FacilityKey } from "@/lib/apartments-data";

type Search = {
  minutes?: number;
  facilities?: string;
  source?: "home" | "find";
  fromView?: "list" | "map";
};

export const Route = createFileRoute("/apartment/$id")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    minutes: s.minutes ? Number(s.minutes) : 15,
    facilities: typeof s.facilities === "string" ? s.facilities : "subway,daiso,oliveyoung,mart",
    source: s.source === "home" ? "home" : "find",
    fromView: s.fromView === "map" ? "map" : "list",
  }),
  component: Detail,
  notFoundComponent: () => (
    <div className="p-10 text-center text-muted-foreground">아파트를 찾을 수 없어요.</div>
  ),
});

const iconMap: Record<FacilityKey, typeof Train> = {
  subway: Train,
  daiso: ShoppingBag,
  oliveyoung: Sparkles,
  mart: Store,
};

function Detail() {
  const { id } = Route.useParams();
  const {
    minutes = 15,
    facilities = "subway,daiso,oliveyoung,mart",
    source = "find",
    fromView = "list",
  } = Route.useSearch();
  const apt = APARTMENTS.find((a) => a.id === id) ?? APARTMENTS[0];
  const keys = facilities.split(",").filter(Boolean) as FacilityKey[];

  return (
    <MobileFrame>
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur">
        <div className="px-4 pt-12 pb-3 flex items-center">
          {source === "home" ? (
            <Link to="/" className="w-9 h-9 -ml-2 flex items-center justify-center">
              <ChevronLeft size={22} />
            </Link>
          ) : (
            <Link
              to="/results"
              search={{ minutes, facilities, view: fromView }}
              className="w-9 h-9 -ml-2 flex items-center justify-center"
            >
              <ChevronLeft size={22} />
            </Link>
          )}
        </div>
      </div>

      <div className="px-5 pb-48">
        <div className="text-[22px] font-bold tracking-tight">{apt.name}</div>
        <div className="text-[13px] text-muted-foreground mt-1">{apt.address}</div>

        {/* Summary card */}
        <div className="mt-6 rounded-3xl bg-accent px-5 py-5 flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-semibold text-accent-foreground/80">생활권 요약</div>
            <div className="mt-1 text-[15px] font-bold text-accent-foreground leading-snug">
              모든 필수 시설이
              <br />
              걸어서 {minutes}분 안에 있어요.
            </div>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-[10px] text-accent-foreground/70">생활권 점수</div>
            <div className="text-[28px] font-bold leading-none text-accent-foreground">
              92<span className="text-[13px] font-semibold ml-0.5">점</span>
            </div>
          </div>
        </div>

        <h2 className="mt-8 text-[18px] font-bold tracking-tight">이 집에서 걸어서</h2>

        <div className="mt-4 space-y-2.5">
          {keys.map((k) => {
            const Icon = iconMap[k];
            const label = FACILITIES.find((f) => f.key === k)?.label ?? k;
            const w = apt.walks[k];
            return (
              <div
                key={k}
                className="bg-card border border-border rounded-3xl px-5 py-4 flex items-center gap-4"
              >
                <div className="w-11 h-11 rounded-2xl bg-muted flex items-center justify-center shrink-0">
                  <Icon size={20} strokeWidth={1.8} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] text-muted-foreground">{label}</div>
                  <div className="text-[14px] font-semibold truncate">{w.name}</div>
                </div>
                <div className="flex items-baseline gap-1 shrink-0">
                  <span className="text-[11px] text-muted-foreground">걸어서</span>
                  <span className="text-[34px] font-bold leading-none tracking-tight">
                    {w.minutes}
                  </span>
                  <span className="text-[13px] font-semibold text-muted-foreground">분</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Map placeholder */}
        <div className="mt-8">
          <h3 className="text-[15px] font-bold">생활권 한눈에 보기</h3>
          <p className="text-[12px] text-muted-foreground mt-1">
            모든 필수 시설이 도보 {minutes}분 안에 있어요.
          </p>

          <div className="mt-4 relative aspect-square rounded-3xl border border-border bg-muted/50 overflow-hidden">
            {/* subtle grid */}
            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  "linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)",
                backgroundSize: "32px 32px",
              }}
            />
            {/* walking area circle */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] aspect-square rounded-full bg-primary/10 border border-primary/30" />
            {/* apartment marker */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
              <div className="w-4 h-4 rounded-full bg-primary ring-4 ring-primary/25" />
              <div className="mt-1.5 text-[10px] font-bold bg-card px-2 py-0.5 rounded-full border border-border whitespace-nowrap">
                {apt.name}
              </div>
            </div>
            {/* facility markers around */}
            {keys.map((k, i) => {
              const angle = (i / keys.length) * Math.PI * 2 - Math.PI / 2;
              const r = 32;
              const x = 50 + Math.cos(angle) * r;
              const y = 50 + Math.sin(angle) * r;
              const label = FACILITIES.find((f) => f.key === k)?.label ?? k;
              return (
                <div
                  key={k}
                  className="absolute flex flex-col items-center -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${x}%`, top: `${y}%` }}
                >
                  <div className="w-3 h-3 rounded-full bg-foreground" />
                  <div className="mt-1 text-[10px] font-medium bg-card/90 px-1.5 py-0.5 rounded-full border border-border whitespace-nowrap">
                    {label} {apt.walks[k].minutes}분
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom fixed */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-background/95 backdrop-blur border-t border-border px-5 pt-3 pb-3 z-20">
        <div className="flex gap-2">
          <button className="w-14 h-14 rounded-2xl border border-border flex items-center justify-center">
            <Bookmark size={20} strokeWidth={1.8} />
          </button>
          <Link
            to="/map"
            search={{ minutes, facilities, source, fromView, apartmentId: apt.id }}
            className="flex-1 h-14 rounded-2xl bg-primary text-primary-foreground font-semibold text-[15px] flex items-center justify-center gap-2"
          >
            <MapIcon size={18} strokeWidth={2} />
            지도에서 보기
          </Link>
        </div>
      </div>

      <BottomNav />
    </MobileFrame>
  );
}
