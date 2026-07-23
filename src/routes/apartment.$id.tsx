import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertCircle,
  ChevronLeft,
  Loader2,
  MapPin,
  ShoppingBag,
  Sparkles,
  Store,
  Train,
} from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { MobileFrame } from "@/components/MobileFrame";
import {
  buildApartmentFacilityMapUrl,
  isApartmentFacilityMapPreloaded,
} from "@/lib/apartment-facility-map";
import {
  DEFAULT_LIFE_SCORE_RADIUS_METER,
  lifeScoreQueryOptions,
  type LifeScoreCategoryDetail,
  type LifeScoreCategoryKey,
  type LifeScoreStore,
} from "@/lib/life-score-api";

type Search = {
  minutes?: number;
  facilities?: string;
  source?: "home" | "find";
  fromView?: "list" | "map";
  apartmentName?: string;
  address?: string;
  lat?: string;
  lng?: string;
  mapReady?: boolean;
};

export const Route = createFileRoute("/apartment/$id")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    minutes: search.minutes ? Number(search.minutes) : 15,
    facilities:
      typeof search.facilities === "string" ? search.facilities : "subway,daiso,oliveyoung,mart",
    source: search.source === "home" ? "home" : "find",
    fromView: search.fromView === "map" ? "map" : "list",
    apartmentName: typeof search.apartmentName === "string" ? search.apartmentName : undefined,
    address: typeof search.address === "string" ? search.address : undefined,
    lat: typeof search.lat === "string" ? search.lat : undefined,
    lng: typeof search.lng === "string" ? search.lng : undefined,
    mapReady: search.mapReady === true || search.mapReady === "true",
  }),
  component: Detail,
});

const CATEGORY_CONFIG: {
  key: LifeScoreCategoryKey;
  label: string;
  Icon: typeof Store;
}[] = [
  { key: "subway", label: "지하철", Icon: Train },
  { key: "mart", label: "마트", Icon: Store },
  { key: "daiso", label: "다이소", Icon: ShoppingBag },
  { key: "oliveYoung", label: "올리브영", Icon: Sparkles },
];

function getDistanceTone(distanceMeter: number) {
  if (distanceMeter <= 300) {
    return {
      dot: "bg-primary ring-primary/25",
      badge: "bg-accent text-accent-foreground",
      border: "border-primary/35",
    };
  }
  if (distanceMeter <= 500) {
    return {
      dot: "bg-amber-400 ring-amber-400/25",
      badge: "bg-amber-100 text-amber-800",
      border: "border-amber-300",
    };
  }
  if (distanceMeter <= 1000) {
    return {
      dot: "bg-red-500 ring-red-500/20",
      badge: "bg-red-100 text-red-700",
      border: "border-red-300",
    };
  }
  return {
    dot: "bg-gray-400 ring-gray-400/20",
    badge: "bg-gray-100 text-gray-600",
    border: "border-gray-300",
  };
}

function Detail() {
  const {
    minutes = 15,
    facilities = "subway,daiso,oliveyoung,mart",
    source = "find",
    fromView = "list",
    apartmentName,
    address,
    lat,
    lng,
    mapReady = false,
  } = Route.useSearch();
  const latitude = Number(lat);
  const longitude = Number(lng);
  const hasSelection = Boolean(
    apartmentName && address && Number.isFinite(latitude) && Number.isFinite(longitude),
  );
  const scoreQuery = useQuery({
    ...lifeScoreQueryOptions({
      lat: latitude,
      lng: longitude,
      radiusMeter: DEFAULT_LIFE_SCORE_RADIUS_METER,
    }),
    enabled: hasSelection,
  });

  if (!hasSelection) {
    return <SelectionMissing />;
  }

  if (scoreQuery.isPending) {
    return (
      <MobileFrame>
        <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
          <Loader2 size={28} className="animate-spin text-primary" />
          <h1 className="mt-5 text-[20px] font-bold">주거 편의성을 분석하고 있어요</h1>
          <p className="mt-2 text-[13px] text-muted-foreground">{apartmentName}</p>
        </div>
        <BottomNav />
      </MobileFrame>
    );
  }

  if (scoreQuery.isError) {
    return (
      <MobileFrame>
        <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
          <AlertCircle size={30} className="text-destructive" />
          <h1 className="mt-5 text-[20px] font-bold">편의성 점수를 불러오지 못했어요</h1>
          <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
            {scoreQuery.error instanceof Error
              ? scoreQuery.error.message
              : "잠시 후 다시 시도해주세요."}
          </p>
          <button
            onClick={() => scoreQuery.refetch()}
            className="mt-6 w-full rounded-2xl bg-primary py-4 text-[14px] font-semibold text-primary-foreground"
          >
            다시 시도
          </button>
          <Link to="/" className="mt-3 text-[13px] text-muted-foreground">
            검색으로 돌아가기
          </Link>
        </div>
        <BottomNav />
      </MobileFrame>
    );
  }

  const score = scoreQuery.data;
  const summaryScores: Record<LifeScoreCategoryKey, number> = {
    subway: score.summary.subwayScore,
    mart: score.summary.martScore,
    daiso: score.summary.daisoScore,
    oliveYoung: score.summary.oliveYoungScore,
  };

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

      <main className="px-5 pb-28">
        <h1 className="text-[22px] font-bold tracking-tight">{apartmentName}</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">{address}</p>

        <section className="mt-6 rounded-3xl bg-accent px-5 py-5 flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-semibold text-accent-foreground/80">
              반경 {DEFAULT_LIFE_SCORE_RADIUS_METER.toLocaleString()}m 분석
            </div>
            <div className="mt-1 text-[17px] font-bold text-accent-foreground leading-snug">
              주거 편의성 총점
            </div>
            <p className="mt-1 text-[11px] text-accent-foreground/70">
              지하철·마트·다이소·올리브영 접근성을 반영했어요.
            </p>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-[34px] font-bold leading-none text-accent-foreground">
              {score.totalScore}
              <span className="text-[13px] font-semibold ml-0.5">점</span>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-[18px] font-bold tracking-tight">카테고리별 점수</h2>
          <p className="mt-1 text-[12px] text-muted-foreground">
            집세권에서 분석한 대표 시설의 카테고리 별 점수예요.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {CATEGORY_CONFIG.map(({ key, label, Icon }) => {
              const category = score.categories[key];
              return (
                <div key={key} className="rounded-2xl border border-border bg-card px-3 py-4">
                  <Icon size={17} className="text-primary" strokeWidth={1.8} />
                  <div className="mt-2 text-[11px] text-muted-foreground">{label}</div>
                  <div className="mt-0.5 flex items-baseline gap-0.5">
                    <span className="text-[22px] font-bold tracking-tight">
                      {summaryScores[key]}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      / {category.maxScore}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-[18px] font-bold tracking-tight">대표 시설까지 걸어서</h2>
          <p className="mt-1 text-[12px] text-muted-foreground">
            집세권이 분석한 대표 시설의 실제 보행 시간이에요.
          </p>
          <div className="mt-4 space-y-2.5">
            {CATEGORY_CONFIG.map(({ key, label, Icon }) => {
              const representative = score.categories[key].stores.find(
                (store) => store.isRepresentative,
              );
              return (
                <div
                  key={key}
                  className="rounded-3xl border border-border bg-card px-5 py-4 flex items-center gap-4"
                >
                  <div className="h-11 w-11 shrink-0 rounded-2xl bg-muted flex items-center justify-center">
                    <Icon size={20} strokeWidth={1.8} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] text-muted-foreground">{label}</div>
                    <div className="truncate text-[14px] font-semibold">
                      {representative?.name ?? "도보 15분 이내 시설 없음"}
                    </div>
                  </div>
                  {representative && (
                    <div className="shrink-0 flex items-baseline gap-1">
                      <span className="text-[11px] text-muted-foreground">걸어서</span>
                      <span className="text-[32px] font-bold leading-none tracking-tight">
                        {representative.walkMinutes}
                      </span>
                      <span className="text-[13px] font-semibold text-muted-foreground">분</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <FacilityMapImage
          key={`${latitude}-${longitude}`}
          apartmentName={apartmentName}
          address={address}
          lat={latitude}
          lng={longitude}
          wasPreloaded={mapReady}
        />

        <section className="mt-8 space-y-5">
          <h2 className="text-[18px] font-bold tracking-tight">점수 산정 근거</h2>
          {CATEGORY_CONFIG.map(({ key, label, Icon }) => (
            <CategoryCard key={key} label={label} Icon={Icon} detail={score.categories[key]} />
          ))}
        </section>
      </main>

      <BottomNav />
    </MobileFrame>
  );
}

function SelectionMissing() {
  return (
    <MobileFrame>
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <AlertCircle size={30} className="text-muted-foreground" />
        <h1 className="mt-5 text-[20px] font-bold">선택된 아파트 정보가 없어요</h1>
        <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
          아파트를 다시 검색하고 목록에서 선택해주세요.
        </p>
        <Link
          to="/"
          className="mt-6 w-full rounded-2xl bg-primary py-4 text-[14px] font-semibold text-center text-primary-foreground"
        >
          검색으로 돌아가기
        </Link>
      </div>
      <BottomNav />
    </MobileFrame>
  );
}

function CategoryCard({
  label,
  Icon,
  detail,
}: {
  label: string;
  Icon: typeof Store;
  detail: LifeScoreCategoryDetail;
}) {
  const representative = detail.stores.find((store) => store.isRepresentative);
  const otherStores = detail.stores.filter((store) => !store.isRepresentative);

  return (
    <article className="rounded-3xl border border-border bg-card p-5">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-2xl bg-muted flex items-center justify-center">
          <Icon size={19} strokeWidth={1.8} />
        </div>
        <div>
          <h3 className="text-[15px] font-bold">{label}</h3>
          <p className="text-[11px] text-muted-foreground">
            {detail.categoryScore} / {detail.maxScore}점
          </p>
        </div>
      </div>
      <p className="mt-4 text-[13px] leading-relaxed text-foreground/80">
        {detail.evaluationSummary}
      </p>

      <div className="mt-4 text-[11px] font-semibold text-muted-foreground">대표 시설</div>
      {representative ? (
        <div className="mt-2">
          <StoreRow store={representative} />
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-border px-4 py-6 text-center text-[12px] text-muted-foreground">
          도보 15분 이내 시설 없음
        </div>
      )}

      {otherStores.length > 0 && (
        <details className="mt-4">
          <summary className="cursor-pointer text-[11px] font-semibold text-muted-foreground">
            기타 검색 시설 {otherStores.length}곳
          </summary>
          <div className="mt-3 space-y-2.5">
            {otherStores.map((store) => (
              <StoreRow key={`${store.name}-${store.latitude}-${store.longitude}`} store={store} />
            ))}
          </div>
        </details>
      )}
    </article>
  );
}

function StoreRow({ store }: { store: LifeScoreStore }) {
  const tone = getDistanceTone(store.distanceMeter);
  return (
    <div className={`rounded-2xl border bg-background px-4 py-3.5 ${tone.border}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[13px] font-semibold">{store.name}</span>
            {store.isRepresentative && (
              <span className="rounded-full bg-primary px-2 py-0.5 text-[9px] font-bold text-primary-foreground">
                대표 시설
              </span>
            )}
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">{store.address}</p>
        </div>
        <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ${tone.badge}`}>
          {store.distanceMeter.toLocaleString()}m
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
        <span>
          걸어서 <strong className="font-semibold text-foreground">{store.walkMinutes}분</strong>
        </span>
        <span>
          등급 <strong className="font-semibold text-foreground">{store.grade}</strong>
        </span>
        <span>
          기본 점수 <strong className="font-semibold text-foreground">{store.baseScore}점</strong>
        </span>
        <span>
          산출 점수{" "}
          <strong className="font-semibold text-foreground">{store.calculatedScore}점</strong>
        </span>
      </div>
    </div>
  );
}

function FacilityMapImage({
  apartmentName,
  address,
  lat,
  lng,
  wasPreloaded,
}: {
  apartmentName: string;
  address: string;
  lat: number;
  lng: number;
  wasPreloaded: boolean;
}) {
  const imageRef = useRef<HTMLImageElement>(null);
  const mapImageUrl = buildApartmentFacilityMapUrl({
    apartmentName,
    address,
    lat,
    lng,
    width: 640,
    height: 480,
  });
  const [imageState, setImageState] = useState<"loading" | "loaded" | "error">(() =>
    wasPreloaded || isApartmentFacilityMapPreloaded(mapImageUrl) ? "loaded" : "loading",
  );

  useEffect(() => {
    const image = imageRef.current;
    if (!image?.complete) return;

    const frame = window.requestAnimationFrame(() => {
      setImageState(image.naturalWidth > 0 ? "loaded" : "error");
    });
    return () => window.cancelAnimationFrame(frame);
  }, [mapImageUrl]);

  return (
    <section id="life-score-map" className="mt-8">
      <h2 className="text-[18px] font-bold tracking-tight">주변 시설 지도</h2>
      <p className="mt-1 text-[12px] text-muted-foreground">
        아파트와 가까운 대표 시설을 실제 지도에서 확인해보세요.
      </p>
      <div className="mt-4 relative aspect-[4/3] overflow-hidden rounded-3xl border border-border bg-muted/50">
        {imageState === "loading" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-[12px] text-muted-foreground">
            <Loader2 size={20} className="animate-spin text-primary" />
            지도를 불러오고 있어요.
          </div>
        )}
        {imageState === "error" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
            <MapPin size={24} className="text-muted-foreground" />
            <p className="mt-3 text-[13px] font-semibold">주변 시설 지도를 불러오지 못했어요.</p>
            <p className="mt-1 text-[11px] text-muted-foreground">잠시 후 다시 확인해주세요.</p>
          </div>
        )}
        <img
          ref={imageRef}
          src={mapImageUrl}
          alt={`${apartmentName} 주변 시설 지도`}
          className={`h-full w-full object-cover transition-opacity ${
            imageState === "loaded" ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setImageState("loaded")}
          onError={() => setImageState("error")}
        />
      </div>
    </section>
  );
}
