import React, { Suspense } from 'react';
import AboutSection from "./components/AboutUs";

const AboutUsPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AboutSection />
    </Suspense>
  );
};

export default AboutUsPage;