"use client";
import React, { useEffect } from "react";
import HeroSection from "./HeroSection";
import BestSeller from "./BestSeller";
import AllCategory from "./AllCategory";
import NewArrivals from "./NewArrivals";
import TodaysDeals from "./TodaysDeals";
import CategoryProducts from "./CategoryProducts";
import ServiceHighlights from "./Support";
import Testimonials from "./Testimonials";
import { useDispatch } from "react-redux";
import { fetchHomeData } from "../store/homeSlice";

const HomeMain = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchHomeData());
  }, [dispatch]);

  return (
    <div className="bg-[#fcfdfc]">
      <HeroSection />
      <AllCategory />
      <BestSeller />
      <NewArrivals />
      <TodaysDeals />
      <CategoryProducts />
      <Testimonials />
      <ServiceHighlights />
    </div>
  );
};

export default HomeMain;