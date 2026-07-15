import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronLeft, List, Map as MapIcon } from "lucide-react";
import { MobileFrame } from "@/components/MobileFrame";
import { BottomNav } from "@/components/BottomNav";
import { APARTMENTS, maxWalk, type FacilityKey } from "@/lib/apartments-data";

type Search = {
  minutes?: number;
  facilities?: string;
  source?: "home" | "find";
  fromView?: "list" | "map";
  apartmentId?: string;
};

export const Route = createFileRoute("/map")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    minutes: s.minutes ? Number(s.minutes) : 15,
    facilities: typeof s.facilities === "string" ? s.facilities : "subway,daiso,oliveyoung,mart",
    source: s.source === "home" ? "home" : "find",
    fromView: s.fromView === "map" ? "map" : "list",
    apartmentId: typeof s.apartmentId === "string" ? s.apartmentId : undefined,
  }),
  component: MapScreen,
});

// Fixed positions to keep map layout stable
const POSITIONS: Record<string, { x: number; y: number }> = {
  "mapo-raemian": { x: 42, y: 38 },
  "gongdeok-xi": { x: 60, y: 55 },
  "sinchon-ipark": { x: 28, y: 62 },
  "mapo-prestige": { x: 55, y: 30 },
};

function MapScreen() {
  const {
    minutes = 15,
    facilities = "subway,daiso,oliveyoung,mart",
    source = "find",
    fromView = "list",
    apartmentId,
  } = Route.useSearch();
  const navigate = useNavigate();
  const keys = useMemo(() => facilities.split(",").filter(Boolean) as FacilityKey[], [facilities]);

  const list = useMemo(
    () => APARTMENTS.filter((a) => maxWalk(a, keys) <= minutes),
    [keys, minutes],
  );

  const [activeId, setActiveId] = useState<string>(apartmentId ?? list[0]?.id ?? APARTMENTS[0].id);
  const active = APARTMENTS.find((a) => a.id === activeId) ?? APARTMENTS[0];

  return (
    <MobileFrame>
      {/* Map background */}
      <div className="absolute inset-0 max-w-[430px] mx-auto bg-[oklch(0.94_0.008_200)]">
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "linear-gradient(oklch(0.9 0.008 200) 1px, transparent 1px), linear-gradient(90deg, oklch(0.9 0.008 200) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Faux roads */}
        <div className="absolute left-0 right-0 top-[45%] h-3 bg-background/70" />
        <div className="absolute top-0 bottom-0 left-[38%] w-3 bg-background/70" />
        <div className="absolute left-0 right-0 top-[70%] h-2 bg-background/50" />

        {/* Markers */}
        {APARTMENTS.map((a) => {
          const pos = POSITIONS[a.id];
          const worst = maxWalk(a, keys);
          const visible = worst <= minutes;
          const isActive = a.id === activeId;
          return (
            <button
              key={a.id}
              onClick={() => setActiveId(a.id)}
              className="absolute -translate-x-1/2 -translate-y-full"
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            >
              <div
                className={
                  "flex items-baseline gap-0.5 px-3 py-1.5 rounded-full shadow-sm border transition " +
                  (isActive
                    ? "bg-primary text-primary-foreground border-primary scale-110"
                    : visible
                      ? "bg-card text-foreground border-border"
                      : "bg-card/70 text-muted-foreground border-border")
                }
              >
                <span className="text-[15px] font-bold leading-none">{worst}</span>
                <span className="text-[10px] font-semibold">분</span>
              </div>
              <div
                className={
                  "w-2 h-2 rounded-full mx-auto -mt-0.5 " +
                  (isActive ? "bg-primary" : "bg-foreground/60")
                }
              />
            </button>
          );
        })}
      </div>

      {/* Top bar */}
      <div className="relative z-10 px-4 pt-12">
        <div className="flex items-center gap-2">
          <Link
            to={source === "home" ? "/apartment/$id" : "/results"}
            params={source === "home" ? { id: apartmentId ?? active.id } : undefined}
            search={
              source === "home"
                ? { minutes, facilities, source: "home", fromView }
                : { minutes, facilities, view: fromView }
            }
            className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center shadow-sm"
          >
            <ChevronLeft size={20} />
          </Link>
          <div className="flex-1 flex gap-1.5 overflow-x-auto">
            <Chip>마포구</Chip>
            <Chip>{minutes}분</Chip>
            <Chip>시설 {keys.length}개</Chip>
          </div>
        </div>

        {source === "find" && (
          <div className="mt-3 inline-flex bg-card border border-border rounded-full p-1 text-[13px] font-medium shadow-sm">
            <button
              onClick={() =>
                navigate({ to: "/results", search: { minutes, facilities, view: "list" } })
              }
              className="px-3.5 py-1.5 rounded-full text-muted-foreground flex items-center gap-1"
            >
              <List size={13} /> 리스트
            </button>
            <button className="px-3.5 py-1.5 rounded-full bg-foreground text-background flex items-center gap-1">
              <MapIcon size={13} /> 지도
            </button>
          </div>
        )}
      </div>

      {/* Bottom card */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-4 z-10">
        <Link
          to="/apartment/$id"
          params={{ id: active.id }}
          search={{ minutes, facilities, source, fromView }}
          className="block bg-card border border-border rounded-3xl p-5 shadow-lg"
        >
          <div className="w-10 h-1 bg-border rounded-full mx-auto -mt-2 mb-3" />
          <div className="text-[17px] font-bold tracking-tight">{active.name}</div>
          <div className="text-[12px] text-muted-foreground mt-0.5">{active.address}</div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-[12px] text-muted-foreground">모든 시설</span>
            <span className="text-[13px] text-muted-foreground">걸어서</span>
            <span className="text-[24px] font-bold tracking-tight">{maxWalk(active, keys)}</span>
            <span className="text-[13px] font-semibold text-muted-foreground">분 이내</span>
          </div>
        </Link>
      </div>

      <BottomNav />
    </MobileFrame>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="shrink-0 px-3 py-1.5 rounded-full bg-card border border-border text-[12px] font-semibold shadow-sm">
      {children}
    </span>
  );
}
