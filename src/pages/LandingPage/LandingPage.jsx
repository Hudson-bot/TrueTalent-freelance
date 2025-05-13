import React, { useState, useEffect, useRef } from "react";
// import "./LandingPage.css";
import { useScroll, useTransform } from "framer-motion";
import AOS from "aos";
// import "aos/dist/aos.css";

import Header from "./Header/Header";
import HeroSection from "./HeroSection/HeroSection";
import ServicesSection from "./ServicesSection/ServicesSection";
import HowItWorks from "./HowItWorks/HowItWorks";
import TalentSection from "./TalentSection/TalentSection";
import TestimonialsSection from "./TestimonialsSection/TestimonialsSection";
import PricingSection from "./PricingSection/PricingSection";
import CTASection from "./CTASection/CTASection";
import Footer from "./Footer/Footer";

const placeholderAnimationData = {
  v: "5.7.3",
  fr: 30,
  ip: 0,
  op: 60,
  w: 300,
  h: 300,
  nm: "Placeholder Animation",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Shape Layer",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: {
          a: 1,
          k: [
            {
              i: { x: [0.833], y: [0.833] },
              o: { x: [0.167], y: [0.167] },
              t: 0,
              s: [0],
            },
            { t: 60, s: [360] },
          ],
        },
        p: { a: 0, k: [150, 150, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] },
      },
      ao: 0,
      shapes: [
        {
          ty: "rc",
          d: 1,
          s: { a: 0, k: [80, 80] },
          p: { a: 0, k: [0, 0] },
          r: { a: 0, k: 0 },
          nm: "Rectangle Path",
          mn: "ADBE Vector Shape - Rect",
        },
        {
          ty: "fl",
          c: { a: 0, k: [0.4, 0.6, 1, 1] },
          o: { a: 0, k: 100 },
          r: 1,
          nm: "Fill",
        },
      ],
      ip: 0,
      op: 60,
      st: 0,
      bm: 0,
    },
  ],
};

const freelanceAnimationData = placeholderAnimationData;
const designAnimationData = placeholderAnimationData;
const developmentAnimationData = placeholderAnimationData;
const collaborationAnimationData = placeholderAnimationData;

const LandingPage = () => {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState({});
  const servicesRef = useRef(null);
  const talentRef = useRef(null);
  const howItWorksRef = useRef(null);
  const stepsContainerRef = useRef(null);
  const [dragConstraints, setDragConstraints] = useState(0);

  const { scrollYProgress } = useScroll();

  // Calculate drag constraints when steps container is mounted
  useEffect(() => {
    if (stepsContainerRef.current) {
      const containerWidth = stepsContainerRef.current.scrollWidth;
      const viewportWidth = stepsContainerRef.current.offsetWidth;
      setDragConstraints(Math.max(0, containerWidth - viewportWidth));
    }
  }, []);
  
  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  // Initialize AOS
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: false,
      mirror: true,
    });
    return () => {
      AOS.refresh();
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      const sections = [servicesRef, talentRef, howItWorksRef];
      sections.forEach((ref) => {
        if (ref.current) {
          const rect = ref.current.getBoundingClientRect();
          const isCurrentlyVisible =
            rect.top < window.innerHeight && rect.bottom >= 0;
          setIsVisible((prev) => ({
            ...prev,
            [ref.current.id]: isCurrentlyVisible,
          }));
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="landing-page">
      <Header />
      
      <HeroSection 
        freelanceAnimationData={freelanceAnimationData} 
        scrollY={scrollY} 
      />
      
      <ServicesSection ref={servicesRef} />
      
      <HowItWorks 
        ref={howItWorksRef}
        isVisible={isVisible}
        developmentAnimationData={developmentAnimationData}
        designAnimationData={designAnimationData}
        collaborationAnimationData={collaborationAnimationData}
        freelanceAnimationData={freelanceAnimationData}
        dragConstraints={dragConstraints}
        stepsContainerRef={stepsContainerRef}
      />
      
      <TalentSection ref={talentRef} />
      
      <TestimonialsSection />
      
      <PricingSection />
      
      <CTASection />
      
      <Footer />
    </div>
  );
};

export default LandingPage;