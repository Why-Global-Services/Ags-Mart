"use client";
import { useEffect, useState } from "react";
import { getActiveTopbar } from "../interceptor/interseptor";

const Topbar = () => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const fetchTopbar = async () => {
      try {
        const res = await getActiveTopbar();
        setMessages(res.data || []);
      } catch (err) {
        console.error("Failed to load topbar messages", err);
      }
    };
    fetchTopbar();
  }, []);

  // If no active messages, don't show topbar
  if (!messages.length) return null;

  return (
    <div className="text-center text-white bg-[#1a4a13] hidden md:block py-2 w-full max-w-full overflow-hidden">
      <marquee
        className="font-medium tracking-wide text-sm"
        behavior="scroll"
        direction="left"
        scrollamount="3"
      >
        {messages.map((item, index) => (
          <span key={item._id} className="mx-2">
            <span className="font-semibold text-green-300">
              {item.highlightText}
            </span>{" "}
            {item.text}

            {/* Dot separator except last item */}
            {index !== messages.length - 1 && (
              <span className="mx-6 text-green-400">•</span>
            )}
          </span>
        ))}
      </marquee>
    </div>
  );
};

export default Topbar;
