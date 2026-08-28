"use client";

import React from "react";
import Link from "next/link";


const BestSellerCard = ({ product }) => {
  return (
    <div className="group relative w-full cursor-pointer">

      <div className="relative overflow-hidden rounded-lg">
        <Link href={`/productdetails/?id=${product._id}`}>
          <img
            src={product.image}
            alt={product.name}
            className="
              w-full 
              h-48 md:h-52 lg:h-56   /* Smaller than normal */
              object-cover
              transition-transform duration-500
              group-hover:scale-110
            "
          />
        </Link>
      </div>

    </div>
  );
};

export default BestSellerCard;
