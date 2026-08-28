"use client";

import { FaWhatsapp } from "react-icons/fa";
import { useSelector } from "react-redux";

export default function WhatsappButton() {
  const contactNumber = useSelector((state) => state.adminProfile.contactNumber);

  if (!contactNumber) return null;

  return (
    <a
      href={`https://wa.me/${contactNumber}?text=${encodeURIComponent(
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
