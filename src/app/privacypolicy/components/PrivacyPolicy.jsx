"use client";

import { useState, useEffect } from "react";
import Loading from "@/app/common/Loading";
import { getPrivacyPolicy } from "@/app/interceptor/interseptor";
import {
  FiAlertCircle,
  FiShield,
  FiUser,
  FiMail,
  FiEye,
  FiHeart,
  FiShoppingBag,
  FiCreditCard,
  FiRefreshCw,
  FiInfo,
} from "react-icons/fi";

const PrivacyPolicy = () => {
  const [privacy, setPrivacy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchPrivacy = async () => {
    try {
      const response = await getPrivacyPolicy();
      const data = response?.data !== undefined ? response.data : response;
      setPrivacy(data);
      setError(false);
    } catch (err) {
      console.error("Error fetching privacy policy:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrivacy();
  }, []);

  if (loading) return <Loading />;

  if (error && !privacy) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <FiAlertCircle className="text-4xl text-amber-500 mx-auto mb-4" />
          <h3 className="text-lg text-gray-800 font-semibold mb-2">
            Unable to Load Privacy Policy
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            We are having trouble retrieving the policy details at the moment. Please try again.
          </p>
          <button
            onClick={fetchPrivacy}
            className="px-6 py-2.5 bg-green-700 hover:bg-green-800 text-white font-medium rounded-xl transition shadow-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const sections = [
    ["introductionTitle", "introductionContent", FiInfo, "bg-blue-100 text-blue-600"],
    ["informationCollectionTitle", "informationCollectionContent", FiEye, "bg-purple-100 text-purple-600"],
    ["useOfInformationTitle", "useOfInformationContent", FiShoppingBag, "bg-green-100 text-green-600"],
    ["dataSecurityTitle", "dataSecurityContent", FiShield, "bg-red-100 text-red-600"],
    ["informationSharingTitle", "informationSharingContent", FiHeart, "bg-yellow-100 text-yellow-600"],
    ["yourRightsTitle", "yourRightsContent", FiCreditCard, "bg-indigo-100 text-indigo-600"],
    ["childrensPrivacyTitle", "childrensPrivacyContent", FiUser, "bg-pink-100 text-pink-600"],
    ["changesToPolicyTitle", "changesToPolicyContent", FiRefreshCw, "bg-orange-100 text-orange-600"],
    ["contactUsTitle", "contactUsContent", FiMail, "bg-cyan-100 text-cyan-600"],
  ];
  const populatedSections = privacy
    ? sections.filter(([title, content]) => privacy[title] || privacy[content])
    : [];

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12 px-4 sm:px-6 lg:px-10">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-16">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-emerald-100 rounded-full flex items-center justify-center">
              <FiShield className="text-2xl sm:text-3xl text-emerald-600" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-emerald-800 mb-3">
            Privacy Policy
          </h1>
        </div>

        {/* Sections */}
        {populatedSections.length > 0 ? (
          <div className="space-y-6 sm:space-y-8">
            {populatedSections
              .map(([title, content, Icon, color], index) => (
                <section
                  key={index}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 md:p-8 hover:shadow-md transition"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 ${color} rounded-xl flex items-center justify-center`}
                    >
                      <Icon className="text-lg sm:text-xl" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mb-2">
                        {privacy[title]}
                      </h2>
                      <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-line">
                        {privacy[content]}
                      </p>
                    </div>
                  </div>
                </section>
              ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
            <FiShield className="text-4xl text-green-600 mx-auto mb-3 opacity-60" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              No Privacy Policy Available
            </h3>
            <p className="text-gray-600 text-sm max-w-lg mx-auto leading-relaxed">
              Privacy policy content has not been published yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrivacyPolicy;
