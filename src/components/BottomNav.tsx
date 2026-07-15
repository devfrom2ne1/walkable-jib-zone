import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Search, Bookmark } from "lucide-react";

export function BottomNav() {
  const location = useRouterState({ select: (s) => s.location });
  const pathname = location.pathname;
  const routeSource = (location.search as { source?: string }).source;
  const isHome =
    pathname === "/" ||
    (routeSource === "home" &&
      (pathname.startsWith("/analyze") ||
        pathname.startsWith("/apartment") ||
        pathname.startsWith("/map")));
  const isFind =
    !isHome &&
    (pathname.startsWith("/find") ||
      pathname.startsWith("/results") ||
      pathname.startsWith("/map") ||
      pathname.startsWith("/apartment"));

  return (
    <>
      <div className="h-20" />
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] h-20 bg-background/95 backdrop-blur border-t border-border z-30">
        <ul className="grid h-full grid-cols-3 pt-2 pb-4">
          <li>
            <Link to="/" className="flex flex-col items-center gap-1 py-1">
              <Home
                size={22}
                className={isHome ? "text-primary" : "text-muted-foreground"}
                strokeWidth={isHome ? 2.4 : 1.8}
              />
              <span
                className={
                  "text-[11px] " + (isHome ? "text-primary font-semibold" : "text-muted-foreground")
                }
              >
                홈
              </span>
            </Link>
          </li>
          <li>
            <Link to="/find" className="flex flex-col items-center gap-1 py-1">
              <Search
                size={22}
                className={isFind ? "text-primary" : "text-muted-foreground"}
                strokeWidth={isFind ? 2.4 : 1.8}
              />
              <span
                className={
                  "text-[11px] " + (isFind ? "text-primary font-semibold" : "text-muted-foreground")
                }
              >
                집 찾기
              </span>
            </Link>
          </li>
          <li>
            <button type="button" className="w-full flex flex-col items-center gap-1 py-1">
              <Bookmark size={22} className="text-muted-foreground" strokeWidth={1.8} />
              <span className="text-[11px] text-muted-foreground">저장</span>
            </button>
          </li>
        </ul>
      </nav>
    </>
  );
}
