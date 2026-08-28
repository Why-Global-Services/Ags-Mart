"use client";

import { useEffect, useState } from "react";
import { getReturnpolicy } from "@/app/interceptor/interseptor";
import Loading from "@/app/common/Loading";

const ReturnPolicyPage = () => {
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchPolicy = async () => {
    try {
      const response = await getReturnpolicy();
      setPolicy(response);
      setError(false);
    } catch (err) {
      console.error("Error fetching return policy:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicy();
  }, []);

  if (loading) {
    return <Loading />;
  }

  if (error || !policy) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <p className="text-lg text-red-600 font-medium">
          Failed to load Return Policy
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12 px-4 sm:px-6 lg:px-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-emerald-800 mb-3">
            Return Policy
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Please read these return policies carefully before using our services.
          </p>
          <div className="w-20 sm:w-24 h-1 bg-emerald-800 mx-auto mt-4 rounded-full" />
        </div>

        {/* Sections */}
        {[
          ["ourReturnPolicy", "ourReturnPolicyContent"],
          ["eligibilityForReturns", "eligibilityForReturnsContent"],
          ["howToReturnAnItem", "howToReturnAnItemContent"],
          ["refundProcess", "refundProcessContent"],
          ["returnShipping", "returnShippingContent"],
        ].map(([title, content], index) => (
          <section key={index} className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-emerald-800 mb-3 flex items-center">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full mr-3" />
              {policy[title]}
            </h2>
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                {policy[content]}
              </p>
            </div>
          </section>
        ))}

        {/* Footer Note */}
        <div className="mt-8 text-center">
          <div className="bg-emerald-800 text-white rounded-xl p-4 sm:p-6 inline-block max-w-3xl">
            <p className="text-sm sm:text-base font-medium">
              By using our services, you acknowledge that you have read,
              understood, and agree to be bound by these Return Policies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReturnPolicyPage;
