export type ApartmentFacilityMapRequest = {
  apartmentName: string;
  address: string;
  lat: number;
  lng: number;
  width?: number;
  height?: number;
  level?: number;
};

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");
const preloadedMapImageUrls = new Set<string>();

export function buildApartmentFacilityMapUrl(request: ApartmentFacilityMapRequest) {
  const params = new URLSearchParams({
    apartmentName: request.apartmentName,
    address: request.address,
    lat: String(request.lat),
    lng: String(request.lng),
    width: String(request.width ?? 640),
    height: String(request.height ?? 480),
  });

  if (request.level !== undefined) params.set("level", String(request.level));

  return `${API_BASE_URL}/api/apartments/facility-map?${params}`;
}

export function preloadApartmentFacilityMap(url: string) {
  return new Promise<void>((resolve, reject) => {
    if (preloadedMapImageUrls.has(url)) {
      resolve();
      return;
    }

    const image = new Image();
    image.onload = () => {
      preloadedMapImageUrls.add(url);
      resolve();
    };
    image.onerror = () => reject(new Error("주변 시설 지도를 미리 불러오지 못했어요."));
    image.src = url;
  });
}

export function isApartmentFacilityMapPreloaded(url: string) {
  return preloadedMapImageUrls.has(url);
}
