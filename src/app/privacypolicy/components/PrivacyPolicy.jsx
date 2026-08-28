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
  FiBook,
} from "react-icons/fi";

const PrivacyPolicy = () => {
  const [privacy, setPrivacy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchPrivacy = async () => {
    try {
      const response = await getPrivacyPolicy();
      setPrivacy(response);
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

  if (error || !privacy) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <FiAlertCircle className="text-4xl text-red-600 mx-auto mb-4" />
          <p className="text-lg text-red-600 font-medium">
            Failed to load Privacy Policy
          </p>
          <button
            onClick={fetchPrivacy}
            className="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-bgvariant-2 transition"
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
          <p className="text-sm sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Your privacy is important to us. Please read this policy carefully.
          </p>
          <div className="mt-3 text-xs sm:text-sm text-gray-500">
            Last Updated: {new Date().toLocaleDateString()}
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-6 sm:space-y-8">
          {sections.map(([title, content, Icon, color], index) => (
            <section
              key={index}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 md:p-8 hover:shadow-md transition"
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 ${color} rounded-xl flex items-center justify-center`}>
                  <Icon className="text-lg sm:text-xl" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mb-2">
                    {privacy[title]}
                  </h2>
                  <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                    {privacy[content]}
                  </p>
                </div>
              </div>
            </section>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-10 sm:mt-12 text-center">
          <div className="bg-emerald-50 rounded-2xl p-6 sm:p-8 border border-emerald-200">
            <FiBook className="text-xl sm:text-2xl text-emerald-600 mx-auto mb-3" />
            <p className="text-emerald-800 font-medium">
              Thank you for taking the time to read our Privacy Policy.
            </p>
            <p className="text-bgvariant-2 text-sm mt-2">
              If you have any questions, feel free to contact us.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
