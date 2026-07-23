type AnalysisSelection = {
  apartmentName: string;
  address: string;
  lat: string;
  lng: string;
};

const COMPLETED_ANALYSIS_KEY = "jipzone:completed-analysis";

function getSelectionKey(selection: AnalysisSelection) {
  return JSON.stringify([
    selection.apartmentName,
    selection.address,
    selection.lat,
    selection.lng,
  ]);
}

export function clearCompletedAnalysis() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(COMPLETED_ANALYSIS_KEY);
}

export function markAnalysisCompleted(selection: AnalysisSelection) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(COMPLETED_ANALYSIS_KEY, getSelectionKey(selection));
}

export function wasAnalysisCompleted(selection: AnalysisSelection) {
  if (typeof window === "undefined") return false;
  return window.sessionStorage.getItem(COMPLETED_ANALYSIS_KEY) === getSelectionKey(selection);
}
