import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Check, ChevronRight, MapPin, ShoppingBag, Sparkles, Store, Train } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { MobileFrame } from "@/components/MobileFrame";
import { FACILITIES, WALKING_TIMES, type FacilityKey } from "@/lib/apartments-data";

export const Route = createFileRoute("/find")({
  head: () => ({
    meta: [
      { title: "집찾기 · 조건으로 찾는 집" },
      {
        name: "description",
        content: "원하는 시설과 도보 시간을 선택해 조건에 맞는 아파트를 찾아보세요.",
      },
    ],
  }),
  component: Find,
});

const facilityIcons: Record<FacilityKey, typeof Train> = {
  subway: Train,
  daiso: ShoppingBag,
  oliveyoung: Sparkles,
  mart: Store,
};

function Find() {
  const navigate = useNavigate();
  const [minutes, setMinutes] = useState<number>(15);
  const [selected, setSelected] = useState<FacilityKey[]>(FACILITIES.map((f) => f.key));

  const toggle = (k: FacilityKey) =>
    setSelected((s) => (s.includes(k) ? s.filter((x) => x !== k) : [...s, k]));

  return (
    <MobileFrame>
      <div className="px-5 pt-14 pb-4">
        <div className="text-[15px] font-bold tracking-tight">집찾기</div>
        <div className="text-[12px] text-muted-foreground mt-0.5">
          조건에 맞는 생활권을 찾아보세요.
        </div>
      </div>

      <div className="px-5 pt-6">
        <h1 className="text-[24px] font-bold leading-[1.35] tracking-tight">
          내 조건에 맞는 집 찾기
        </h1>
        <p className="mt-3 text-[13px] text-muted-foreground leading-relaxed">
          원하는 시설과 도보 시간을 선택해
          <br />
          조건에 맞는 아파트를 찾아보세요.
        </p>

        <button className="mt-6 w-full flex items-center justify-between bg-card border border-border rounded-2xl px-4 py-3.5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <MapPin size={15} className="text-foreground" strokeWidth={1.8} />
            </div>
            <div className="text-left">
              <div className="text-[11px] text-muted-foreground">지역</div>
              <div className="text-[14px] font-semibold">서울특별시 마포구</div>
            </div>
          </div>
          <ChevronRight size={16} className="text-muted-foreground" />
        </button>

        <div className="mt-5">
          <div className="text-[12px] text-muted-foreground mb-2">도보 시간</div>
          <div className="grid grid-cols-4 gap-2">
            {WALKING_TIMES.map((m) => {
              const active = m === minutes;
              return (
                <button
                  key={m}
                  onClick={() => setMinutes(m)}
                  className={
                    "py-3 rounded-2xl border text-center transition " +
                    (active
                      ? "bg-primary border-primary text-primary-foreground"
                      : "bg-card border-border text-foreground")
                  }
                >
                  <div className="text-[17px] font-bold leading-none">{m}</div>
                  <div
                    className={
                      "text-[10px] mt-1 " + (active ? "opacity-90" : "text-muted-foreground")
                    }
                  >
                    분
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-5">
          <div className="text-[12px] text-muted-foreground mb-2">필요한 시설</div>
          <div className="grid grid-cols-2 gap-2.5">
            {FACILITIES.map((f) => {
              const Icon = facilityIcons[f.key];
              const active = selected.includes(f.key);
              return (
                <button
                  key={f.key}
                  onClick={() => toggle(f.key)}
                  className={
                    "relative rounded-2xl border p-3.5 text-left transition " +
                    (active
                      ? "bg-card border-primary/60 ring-1 ring-primary/30"
                      : "bg-card border-border")
                  }
                >
                  <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                    <Icon size={17} strokeWidth={1.8} className="text-foreground" />
                  </div>
                  <div className="mt-2.5 text-[14px] font-semibold">{f.label}</div>
                  {active && (
                    <div className="absolute top-2.5 right-2.5 w-4.5 h-4.5 rounded-full bg-primary flex items-center justify-center p-0.5">
                      <Check size={10} className="text-primary-foreground" strokeWidth={3} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="px-5 pt-8 pb-8">
        <button
          onClick={() =>
            navigate({
              to: "/results",
              search: { minutes, facilities: selected.join(",") },
            })
          }
          disabled={selected.length === 0}
          className="w-full py-4 rounded-2xl bg-card border border-primary/60 text-primary font-semibold text-[15px] disabled:opacity-40"
        >
          조건으로 집 찾기
        </button>
      </div>

      <BottomNav />
    </MobileFrame>
  );
}
