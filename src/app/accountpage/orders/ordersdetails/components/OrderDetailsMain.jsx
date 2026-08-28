"use client";
import React from "react";
import OrderTracking from "./OrderTracking";

const OrderDetailsMain = () => {
  // ✅ temporary mock data so build won't fail
  const mockOrder = {
    orderStatus: "Shipped",
    orderId: "ORD12345",
    createdAt: new Date().toISOString(),
    orderDetails: [
      {
        products: {
          productDetails: {
            productName: "Gentle Baby Shampoo",
            productImages: ["/placeholder.png"],
            variant: {
              colorOnlyVariants: [],
            },
          },
          quantity: 1,
          subtotal: 299,
          variantId: "mockVariantId",
        },
      },
    ],
  };

  return (
    <div>
      <OrderTracking order={mockOrder} />
    </div>
  );
};

export default OrderDetailsMain;
