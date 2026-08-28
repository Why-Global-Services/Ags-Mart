'use client'

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RiArrowGoBackLine } from "react-icons/ri";
import Shipping from "./Shipping";
import Review from "./Reveiw";
import AuthPage from "@/app/common/LoginPage";
import { useAuth } from "@/context/AuthContext";

const Checkout = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [buyNowItem, setBuyNowItem] = useState(null);
  const [selectedDeliveryAddress, setSelectedDeliveryAddress] = useState(null);
  const [selectedBillingAddress, setSelectedBillingAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  
  const isBuyNow = searchParams.get('buyNow') === 'true';
  const urlProductId = searchParams.get('productId');
  const urlVariantId = searchParams.get('variantId');

  useEffect(() => {
    const loadCheckoutData = () => {
      if (isBuyNow) {
        if (urlProductId) {
          const storedItem = localStorage.getItem("buyNowItem");
          
          if (storedItem) {
            const parsedItem = JSON.parse(storedItem);
            
            // Verify the stored item matches URL params
            if (parsedItem.productId === urlProductId && 
                (urlVariantId ? parsedItem.variantId === urlVariantId : true)) {
              console.log("Loaded Buy Now item from localStorage:", parsedItem);
              setBuyNowItem(parsedItem);
            } else {
              console.warn("Stored item doesn't match URL params");
              alert("Product data mismatch. Please try again.");
              router.back();
            }
          } else {
            console.warn("No buyNowItem found in localStorage");
            alert("Product data not found. Please select the product again.");
            router.back();
          }
        } else {
          console.error("Buy Now mode but no productId in URL");
          alert("Invalid checkout link. Please try again.");
          router.back();
        }
      }
      setLoading(false);
    };

    loadCheckoutData();
  }, [isBuyNow, urlProductId, urlVariantId, router]);

  // USE useCallback TO MEMOIZE THE FUNCTION - THIS FIXES THE INFINITE LOOP
  const handleAddressUpdate = useCallback((deliveryId, billingId) => {
    setSelectedDeliveryAddress(deliveryId);
    setSelectedBillingAddress(billingId);
  }, []); // Empty dependency array since it only uses setState

if (authLoading) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-700" />
    </div>
  );
}

if (!user) {
  return <AuthPage />;
}

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-800 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            Checkout {isBuyNow && <span className="text-blue-600 text-lg">(Buy Now)</span>}
          </h1>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-800 text-lg sm:text-base font-fontcontent hover:text-emerald-800 transition-colors"
          >
            <RiArrowGoBackLine className="text-xl" />
            Go Back
          </button>
        </div>

        {/* {isBuyNow && buyNowItem && process.env.NODE_ENV === 'development' && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs">
            <p><strong>Product ID:</strong> {urlProductId}</p>
            {urlVariantId && <p><strong>Variant ID:</strong> {urlVariantId}</p>}
          </div>
        )} */}

        <div className="space-y-8">
          <Shipping onAddressUpdate={handleAddressUpdate} />
          
          <Review 
            buyNowItem={buyNowItem}
            isBuyNow={isBuyNow}
            deliveryAddressId={selectedDeliveryAddress}
            billingAddressId={selectedBillingAddress}
          />
        </div>
      </div>
    </div>
  );
};

export default Checkout;