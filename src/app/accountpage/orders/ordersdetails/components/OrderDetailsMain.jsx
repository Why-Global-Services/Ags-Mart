"use client";
import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const OrderDetailsMain = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams ? searchParams.get("orderId") : null;

  useEffect(() => {
    if (orderId) {
      router.replace(`/track?orderId=${encodeURIComponent(orderId)}`);
    } else {
      router.replace("/accountpage/orders");
    }
  }, [orderId, router]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-gray-500">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm">Redirecting to order tracking...</p>
      </div>
    </div>
  );
};

export default OrderDetailsMain;
