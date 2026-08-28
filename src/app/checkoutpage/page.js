import { Suspense } from "react";
import Checkout from "./components/Checkout";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading checkout...</div>}>
      <Checkout />
    </Suspense>
  );
}
