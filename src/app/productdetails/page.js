import { Suspense } from "react";
import ProductDetails from "./components/ProductDetails";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductDetails />
    </Suspense>
  );
}