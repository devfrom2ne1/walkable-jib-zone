import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Building2 } from "lucide-react";
import { MobileFrame } from "@/components/MobileFrame";
import { BottomNav } from "@/components/BottomNav";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "집의기준 · 집값보다 생활을 기준으로" },
      {
        name: "description",
        content: "아파트명이나 주소를 입력하면 주변 생활시설까지 도보 시간을 분석해드려요.",
      },
      { property: "og:title", content: "집의기준 · 집값보다 생활을 기준으로" },
      {
        property: "og:description",
        content: "아파트명이나 주소를 입력하면 주변 생활시설까지 도보 시간을 분석해드려요.",
      },
    ],
  }),
  component: Home,
});

const SUGGESTIONS = [
  { id: "mapo-raemian", name: "마포래미안푸르지오", address: "서울특별시 마포구 마포대로 195" },
  { id: "mapo-prestige", name: "마포프레스티지자이", address: "서울특별시 마포구 대흥로 175" },
  { id: "gongdeok-xi", name: "공덕자이", address: "서울특별시 마포구 마포대로26길 19" },
];

function Home() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return SUGGESTIONS.filter(
      (s) => s.name.toLowerCase().includes(q) || s.address.toLowerCase().includes(q),
    );
  }, [query]);

  const goAnalyze = (id: string) => {
    navigate({ to: "/analyze", search: { id, source: "home" } });
  };

  const submitSearch = () => {
    const pick = filtered[0] ?? SUGGESTIONS[0];
    goAnalyze(pick.id);
  };

  return (
    <MobileFrame>
      {/* Brand */}
      <div className="px-5 pt-14 pb-4">
        <div className="text-[15px] font-bold tracking-tight">집의기준</div>
        <div className="text-[12px] text-muted-foreground mt-0.5">집값보다 생활을 기준으로.</div>
      </div>

      <div className="px-5 pt-6">
        <h1 className="text-[26px] font-bold leading-[1.35] tracking-tight">
          궁금한 집의 생활권을
          <br />
          바로 확인해보세요
        </h1>
        <p className="mt-3 text-[13px] text-muted-foreground leading-relaxed">
          아파트명이나 주소를 입력하면
          <br />
          주변 생활시설까지 걸리는 시간을 분석해드려요.
        </p>

        <div className="mt-6">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground"
              strokeWidth={2}
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submitSearch();
              }}
              placeholder="아파트명 또는 주소를 입력하세요"
              className="w-full h-16 pl-12 pr-5 rounded-2xl bg-card border border-border text-[15px] font-medium placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {filtered.length > 0 && (
            <div className="mt-2 bg-card border border-border rounded-2xl overflow-hidden">
              {filtered.map((s) => (
                <button
                  key={s.id}
                  onClick={() => goAnalyze(s.id)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-muted/60 border-b border-border last:border-b-0"
                >
                  <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0">
                    <Building2 size={16} strokeWidth={1.8} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[14px] font-semibold truncate">{s.name}</div>
                    <div className="text-[12px] text-muted-foreground truncate">{s.address}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {filtered.length === 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="text-[11px] text-muted-foreground py-1">예시</span>
              {["마포래미안푸르지오", "서울 마포구 마포대로 195"].map((ex) => (
                <button
                  key={ex}
                  onClick={() => setQuery(ex)}
                  className="text-[12px] px-3 py-1 rounded-full bg-muted text-muted-foreground"
                >
                  {ex}
                </button>
              ))}
            </div>
          )}

          <button
            onClick={submitSearch}
            className="mt-5 w-full h-14 rounded-2xl bg-primary text-primary-foreground font-semibold text-[16px]"
          >
            생활권 분석하기
          </button>
        </div>
      </div>

      <BottomNav />
    </MobileFrame>
  );
}
