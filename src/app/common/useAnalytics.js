// "use client";

// import { usePathname, useSearchParams } from "next/navigation";
// import { useEffect } from "react";

// export default function useAnalytics() {
//   const pathname = usePathname();
//   const searchParams = useSearchParams();

//   useEffect(() => {
//     const url = pathname + searchParams.toString();
//     if (typeof window.gtag === "function") {
//       window.gtag("config", "G-BCY42QTL6K", {
//         page_path: url,
//       });
//     }
//   }, [pathname, searchParams]);
// }
