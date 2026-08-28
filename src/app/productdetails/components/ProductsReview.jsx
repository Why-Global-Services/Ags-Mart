"use client";

import React from "react";
import { FaStar } from "react-icons/fa";

const ProductReviews = ({ averageRating = 0, reviews = [] }) => {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="mt-10 border-t pt-6">
        <h3 className="text-xl font-semibold mb-2">Customer Reviews</h3>
        <p className="text-gray-500 text-sm">No reviews yet.</p>
      </div>
    );
  }

  return (
    <div className="mt-10 border-t pt-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <h3 className="text-xl font-semibold">Customer Reviews</h3>

        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <FaStar
              key={i}
              className={`${
                i < Math.round(averageRating)
                  ? "text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          ))}
          <span className="text-sm text-gray-600 ml-2">
            {averageRating.toFixed(1)} / 5
          </span>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div
            key={review._id}
            className="bg-gray-50 border border-gray-200 rounded-lg p-4"
          >
            {/* User & Rating */}
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium text-gray-800 capitalize">
                {review.userName || "Anonymous"}
              </div>

              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <FaStar
                    key={i}
                    className={`text-sm ${
                      i < review.rating
                        ? "text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Review Text */}
            <p className="text-gray-700 text-sm leading-relaxed">
              {review.review}
            </p>

            {/* Date */}
            <p className="text-xs text-gray-500 mt-2">
              {new Date(review.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductReviews;
