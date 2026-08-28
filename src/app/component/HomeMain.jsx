"use client"
import React, { useEffect } from 'react'
import HeroSection from './HeroSection'
import BestSeller from './BestSeller'
import AllCategory from './AllCategory'
import Hair from './Hair'
import BabyCare from './BabyCare'
import Foods from './Foods'
import ServiceHighlights from './Support'
import LipCare from './LipCare'
import NewArrivals from './NewArrivals'
import { useDispatch, useSelector } from "react-redux";
import { fetchHomeData } from "../store/homeSlice";
import Testimonials from './Testimonials'
import TodaysDeals from './TodaysDeals'

const HomeMain = () => {

  const dispatch = useDispatch();


  useEffect(() => {
    dispatch(fetchHomeData());
  }, [dispatch]);

  return (
    <div>
        <HeroSection />
        <AllCategory />
        <BestSeller />
        <NewArrivals />
        <TodaysDeals />
        <Hair />
        <LipCare />
        <BabyCare />
        <Foods />
        <Testimonials />
        <ServiceHighlights />
    </div>
  )
}

export default HomeMain