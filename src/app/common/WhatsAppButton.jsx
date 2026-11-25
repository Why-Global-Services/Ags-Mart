"use client";

import { FaWhatsapp } from "react-icons/fa";
import { useSelector } from "react-redux";

const DEFAULT_ADMIN_WHATSAPP = "919789676031";

export default function WhatsappButton() {
  const reduxNumber = useSelector((state) => state.adminProfile?.contactNumber);
  const rawNumber = reduxNumber || DEFAULT_ADMIN_WHATSAPP;
  const cleanNumber = String(rawNumber).replace(/\D/g, "");

  const isInvalidOrOldNumber =
    !cleanNumber ||
    cleanNumber.includes("9876543210") ||
    cleanNumber.includes("9344430739");

  const formattedNumber = isInvalidOrOldNumber
    ? DEFAULT_ADMIN_WHATSAPP
    : cleanNumber.startsWith("91") && cleanNumber.length === 12
    ? cleanNumber
    : cleanNumber.length === 10
    ? `91${cleanNumber}`
    : DEFAULT_ADMIN_WHATSAPP;

  return (
    <a
      href={`https://wa.me/${formattedNumber}?text=${encodeURIComponent(
        "Hi Admin, I need help regarding my account."
      )}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 right-5 md:bottom-20 md:right-5 lg:bottom-10 lg:right-5 z-50 bg-[#25D366] text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
    >
      <FaWhatsapp size={28} />
    </a>
  );
}
