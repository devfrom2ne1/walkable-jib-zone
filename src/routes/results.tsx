import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  SlidersHorizontal,
  ArrowUpDown,
  Map as MapIcon,
  List,
  Train,
  ShoppingBag,
  Sparkles,
  Store,
  Check,
} from "lucide-react";
import { MobileFrame } from "@/components/MobileFrame";
import { BottomNav } from "@/components/BottomNav";
import { APARTMENTS, FACILITIES, maxWalk, type FacilityKey } from "@/lib/apartments-data";

type Search = { minutes?: number; facilities?: string; view?: "list" | "map" };

export const Route = createFileRoute("/results")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    minutes: s.minutes ? Number(s.minutes) : 15,
    facilities: typeof s.facilities === "string" ? s.facilities : "subway,daiso,oliveyoung,mart",
    view: s.view === "map" ? "map" : "list",
  }),
  component: Results,
});

const iconMap: Record<FacilityKey, typeof Train> = {
  subway: Train,
  daiso: ShoppingBag,
  oliveyoung: Sparkles,
  mart: Store,
};

const POSITIONS: Record<string, { x: number; y: number }> = {
  "mapo-raemian": { x: 42, y: 34 },
  "gongdeok-xi": { x: 60, y: 53 },
  "sinchon-ipark": { x: 28, y: 63 },
  "mapo-prestige": { x: 55, y: 28 },
};

function Results() {
  const {
    minutes = 15,
    facilities = "subway,daiso,oliveyoung,mart",
    view = "list",
  } = Route.useSearch();
  const navigate = useNavigate();
  const keys = useMemo(() => facilities.split(",").filter(Boolean) as FacilityKey[], [facilities]);

  const list = useMemo(
    () => APARTMENTS.filter((a) => maxWalk(a, keys) <= minutes),
    [keys, minutes],
  );

  return (
    <MobileFrame>
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border">
        <div className="px-4 pt-12 pb-3 flex items-center gap-2">
          <Link to="/find" className="w-9 h-9 -ml-2 flex items-center justify-center">
            <ChevronLeft size={22} />
          </Link>
          <div className="flex-1 min-w-0">
            <div className="text-[15px] font-semibold truncate">마포구 · 걸어서 {minutes}분</div>
            <div className="text-[12px] text-muted-foreground">
              조건에 맞는 아파트 {list.length}곳
            </div>
          </div>
        </div>

        {/* Segmented control */}
        <div className="px-4 pb-3">
          <div className="bg-muted rounded-full p-1 flex text-[13px] font-medium">
            <button
              onClick={() =>
                navigate({ to: "/results", search: { minutes, facilities, view: "list" } })
              }
              className={
                "flex-1 py-2 rounded-full flex items-center justify-center gap-1.5 transition " +
                (view === "list" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground")
              }
            >
              <List size={15} strokeWidth={2} /> 리스트
            </button>
            <button
              onClick={() =>
                navigate({ to: "/results", search: { minutes, facilities, view: "map" } })
              }
              className={
                "flex-1 py-2 rounded-full flex items-center justify-center gap-1.5 transition " +
                (view === "map" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground")
              }
            >
              <MapIcon size={15} strokeWidth={2} /> 지도
            </button>
          </div>
        </div>
      </div>

      {/* Filters row */}
      <div className="px-4 py-3 flex gap-2">
        <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-border bg-card text-[13px]">
          <ArrowUpDown size={13} /> 거리순
        </button>
        <Link
          to="/find"
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-border bg-card text-[13px]"
        >
          <SlidersHorizontal size={13} /> 조건 변경
        </Link>
      </div>

      {view === "list" ? (
        <div className="px-4 pb-6 space-y-3">
          {list.map((a) => {
            const worst = maxWalk(a, keys);
            return (
              <Link
                key={a.id}
                to="/apartment/$id"
                params={{ id: a.id }}
                search={{ minutes, facilities, source: "find", fromView: "list" }}
                className="block bg-card border border-border rounded-3xl p-5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-[17px] font-bold tracking-tight">{a.name}</div>
                    <div className="text-[12px] text-muted-foreground mt-0.5">{a.address}</div>
                  </div>
                  <div className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent">
                    <Check size={11} className="text-accent-foreground" strokeWidth={3} />
                    <span className="text-[11px] font-semibold text-accent-foreground">
                      모두 도보 {worst}분 이내
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  {keys.map((k) => {
                    const Icon = iconMap[k];
                    const label = FACILITIES.find((f) => f.key === k)?.label ?? k;
                    const w = a.walks[k];
                    return (
                      <div key={k} className="rounded-2xl bg-muted/60 px-3.5 py-3">
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          <Icon size={12} strokeWidth={1.8} />
                          {label}
                        </div>
                        <div className="mt-1 flex items-baseline gap-1">
                          <span className="text-[11px] text-muted-foreground">걸어서</span>
                          <span className="text-[26px] font-bold leading-none tracking-tight">
                            {w.minutes}
                          </span>
                          <span className="text-[12px] font-semibold text-muted-foreground">
                            분
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Link>
            );
          })}

          {list.length === 0 && (
            <div className="text-center text-[13px] text-muted-foreground py-16">
              조건에 맞는 아파트가 없어요.
            </div>
          )}
        </div>
      ) : (
        <ResultsMap list={list} keys={keys} minutes={minutes} facilities={facilities} />
      )}

      <BottomNav />
    </MobileFrame>
  );
}

type Apartment = (typeof APARTMENTS)[number];

function ResultsMap({
  list,
  keys,
  minutes,
  facilities,
}: {
  list: Apartment[];
  keys: FacilityKey[];
  minutes: number;
  facilities: string;
}) {
  const [activeId, setActiveId] = useState(list[0]?.id ?? "");

  useEffect(() => {
    if (!list.some((a) => a.id === activeId)) {
      setActiveId(list[0]?.id ?? "");
    }
  }, [activeId, list]);

  if (list.length === 0) {
    return (
      <div className="px-4 pb-6">
        <div className="text-center text-[13px] text-muted-foreground py-16">
          조건에 맞는 아파트가 없어요.
        </div>
      </div>
    );
  }

  const active = list.find((a) => a.id === activeId) ?? list[0];

  return (
    <div className="relative h-[calc(100vh-300px)] overflow-hidden bg-[oklch(0.94_0.008_200)]">
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(oklch(0.9 0.008 200) 1px, transparent 1px), linear-gradient(90deg, oklch(0.9 0.008 200) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="absolute left-0 right-0 top-[43%] h-3 bg-background/70" />
      <div className="absolute top-0 bottom-0 left-[38%] w-3 bg-background/70" />
      <div className="absolute left-0 right-0 top-[68%] h-2 bg-background/50" />

      {list.map((a) => {
        const pos = POSITIONS[a.id] ?? { x: 50, y: 50 };
        const worst = maxWalk(a, keys);
        const isActive = a.id === active.id;

        return (
          <button
            key={a.id}
            onClick={() => setActiveId(a.id)}
            className="absolute -translate-x-1/2 -translate-y-full"
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
          >
            <div
              className={
                "flex items-baseline gap-0.5 rounded-full border px-3 py-1.5 shadow-sm transition " +
                (isActive
                  ? "scale-110 border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground")
              }
            >
              <span className="text-[15px] font-bold leading-none">{worst}</span>
              <span className="text-[10px] font-semibold">분</span>
            </div>
            <div
              className={
                "mx-auto -mt-0.5 h-2 w-2 rounded-full " +
                (isActive ? "bg-primary" : "bg-foreground/60")
              }
            />
          </button>
        );
      })}

      <Link
        to="/apartment/$id"
        params={{ id: active.id }}
        search={{ minutes, facilities, source: "find", fromView: "map" }}
        className="absolute bottom-4 left-4 right-4 block rounded-3xl border border-border bg-card p-5 shadow-lg"
      >
        <div className="mx-auto -mt-2 mb-3 h-1 w-10 rounded-full bg-border" />
        <div className="text-[17px] font-bold tracking-tight">{active.name}</div>
        <div className="mt-0.5 text-[12px] text-muted-foreground">{active.address}</div>
        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="text-[12px] text-muted-foreground">모든 시설</span>
          <span className="text-[13px] text-muted-foreground">걸어서</span>
          <span className="text-[24px] font-bold tracking-tight">{maxWalk(active, keys)}</span>
          <span className="text-[13px] font-semibold text-muted-foreground">분 이내</span>
        </div>
      </Link>
    </div>
  );
}
