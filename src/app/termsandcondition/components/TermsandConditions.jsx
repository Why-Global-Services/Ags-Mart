"use client";

import { useEffect, useState } from "react";
import Loading from "@/app/common/Loading";
import { TermsAndCondition } from "@/app/interceptor/interseptor";

const TermsandCondition = () => {
  const [terms, setTerms] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchTerms = async () => {
    try {
      const response = await TermsAndCondition();
      setTerms(response);
      setError(false);
    } catch (err) {
      console.error("Failed to fetch terms:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTerms();
  }, []);

  if (loading) return <Loading />;

  if (error || !terms) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <p className="text-lg text-red-600 font-medium">
          Failed to load Terms & Conditions
        </p>
      </div>
    );
  }

  const sections = [
    ["acceptanceOfTermsTitle", "acceptanceOfTermsContent"],
    ["userAccountsRegistrationTitle", "userAccountsRegistrationContent"],
    ["productInformationTitle", "productInformationContent"],
    ["purchasePaymentTitle", "purchasePaymentContent"],
    ["intellectualPropertyTitle", "intellectualPropertyContent"],
    ["disclaimersLimitationsTitle", "disclaimersLimitationsContent"],
    ["governingLawTitle", "governingLawContent"],
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12 px-4 sm:px-6 lg:px-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-emerald-800 mb-3">
            Terms & Conditions
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Please read these terms carefully before using our services.
          </p>
          <div className="w-20 sm:w-24 h-1 bg-emerald-800 mx-auto mt-4 rounded-full" />
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 p-4 sm:p-6 md:p-8">
          {/* Last Updated */}
          <div className="text-right mb-6">
            <p className="text-xs sm:text-sm text-gray-500">
              Last Updated:{" "}
              {new Date(terms.updatedAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>

          {/* Sections */}
          {sections.map(([title, content], index) => (
            <section key={index} className="mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-emerald-800 mb-3 flex items-center">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full mr-3" />
                {terms[title]}
              </h2>
              <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
                <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                  {terms[content]}
                </p>
              </div>
            </section>
          ))}

          {/* Contact */}
          <section className="mt-10 pt-6 border-t border-gray-200">
            <h3 className="text-lg sm:text-xl font-bold text-emerald-800 mb-3">
              Contact Us
            </h3>
            <div className="bg-emerald-50 rounded-xl p-4 sm:p-6">
              <p className="text-emerald-800 text-sm sm:text-base">
                If you have any questions about these Terms and Conditions,
                please contact us at:
              </p>
              <p className="text-bgvariant-2 font-semibold mt-2">
                dina_d123@yahoo.co.in
              </p>
            </div>
          </section>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center">
          <div className="bg-emerald-800 text-white rounded-xl p-4 sm:p-6 inline-block max-w-3xl">
            <p className="text-sm sm:text-base font-medium">
              By using our services, you acknowledge that you have read,
              understood, and agree to be bound by these Terms and Conditions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsandCondition;
