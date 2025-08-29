'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { CheckCircle } from "lucide-react";


const Home = () => {
  const [scrollY, setScrollY] = useState(0);
  const { scrollYProgress } = useScroll();
  
  // Mouse tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Transform values based on scroll
  const titleScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.8]);
  const titleY = useTransform(scrollYProgress, [0, 0.3], [0, -100]);
  const fadeOut = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const marqueeOpacity = useTransform(scrollYProgress, [0.1, 0.3], [0, 1]);
  
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    const handleMouseMove = (e: globalThis.MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
      }, [mouseX, mouseY]);


    const sectionRef = useRef(null);

  // Sample meeting data
  const meetings = [
    {
      name: "Q4 Strategy Planning",
      time: "2:30 PM - 3:45 PM",
      participants: "Sarah Chen, Mike Rodriguez, Alex Thompson",
      summary: "Discussed quarterly goals, budget allocation, and key performance indicators for the upcoming quarter."
    },
    {
      name: "Product Review Session",
      time: "10:00 AM - 11:30 AM", 
      participants: "Emma Wilson, David Park, Lisa Zhang",
      summary: "Reviewed latest product features, user feedback analysis, and prioritized upcoming development tasks."
    },
    {
      name: "Client Onboarding Call",
      time: "4:00 PM - 5:00 PM",
      participants: "John Smith, Maria Garcia, Tom Anderson",
      summary: "Completed client requirements gathering, established project timeline, and defined success metrics."
    },
    {
      name: "Team Retrospective",
      time: "1:00 PM - 2:00 PM",
      participants: "All Development Team",
      summary: "Reflected on sprint performance, identified improvement areas, and celebrated team achievements."
    },
    {
      name: "Marketing Campaign Review",
      time: "11:00 AM - 12:30 PM",
      participants: "Rachel Kim, Steve Johnson, Amy Liu",
      summary: "Analyzed campaign performance metrics, discussed optimization strategies, and planned next phase rollout."
    }
  ];

  const CursorFollower = () => (
    <motion.div
      className="fixed pointer-events-none z-50"
      style={{
        x: mouseX,
        y: mouseY,
      }}
    >
      <div className="relative">
        {/* Dark green ring */}
        <div className="absolute -inset-2 border-2 border-green-800/80 rounded-full" />
        {/* Cursor icon */}
        <svg 
          className="w-6 h-6 text-green-700"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
          />
        </svg>
      </div>
    </motion.div>
  );

  const features = [
    {
      title: "AI-Powered Summaries",
      description:
        "Get concise, accurate summaries of meetings, lectures, or documents powered by advanced AI.",
    },
    {
      title: "Real-Time Insights",
      description:
        "Analyze conversations instantly and get actionable points without missing a detail.",
    },
    {
      title: "Cross-Platform Access",
      description:
        "Access your summaries anywhere, anytime, across web and mobile platforms.",
    },
    {
      title: "Collaboration Ready",
      description:
        "Share and collaborate on summaries with your team seamlessly.",
    },
  ];

  const pricingPlans = [
    {
      title: "Free Plan",
      price: "Free",
      description: "Perfect to get started with SummarifyAI",
      features: [
        "20 credits on sign up",
        "5 credits every month",
        "Basic AI Summaries",
        "Email support",
      ],
      button: "Get Started",
    },
    {
      title: "Standard Plan",
      price: "$20",
      description: "For regular users who need more credits",
      features: [
        "100 credits",
        "Priority AI processing",
        "Access to all summary formats",
        "Email & chat support",
      ],
      button: "Buy Now",
    },
    {
      title: "Pro Plan",
      price: "$50",
      description: "For power users & businesses",
      features: [
        "300 credits",
        "Priority AI + advanced models",
        "Export summaries in multiple formats",
        "Premium support",
      ],
      button: "Go Pro",
    },
  ];
  

  interface MeetingCardProps {
    meeting: {
      name: string;
      time: string;
      participants: string;
      summary: string;
    };
  }

  const MarqueeCard = ({ meeting }: MeetingCardProps) => (
    <motion.div 
      className="bg-black/20 backdrop-blur-md border border-green-500/20 rounded-2xl p-6 min-w-[400px] mr-6 transition-all duration-500 hover:border-green-400/40 hover:shadow-xl hover:shadow-green-500/20"
      whileHover={{ 
        scale: 1.02,
        backgroundColor: "rgba(0, 0, 0, 0.3)",
        borderColor: "rgba(34, 197, 94, 0.5)"
      }}
    >
      <h3 className="text-green-400 font-semibold text-lg mb-2">{meeting.name}</h3>
      <div className="text-green-300/70 text-sm mb-1">🕒 {meeting.time}</div>
      <div className="text-green-300/70 text-sm mb-3">👥 {meeting.participants}</div>
      <p className="text-gray-300 text-sm leading-relaxed">{meeting.summary}</p>
    </motion.div>
  );

  const headingOpacity = useTransform(scrollYProgress, [0, 0.9], [1, 0]);

  return (
    <div className="min-h-[200vh] pb-40 overflow-x-hidden relative cursor-none">
      {/* Organic Flowing Background - Halo Style */}
      <div className="fixed inset-0 overflow-hidden bg-black">
        
        {/* Large organic flowing shapes */}
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              "radial-gradient(ellipse 80% 60% at 20% 30%, #012a20 0%, transparent 50%), radial-gradient(ellipse 60% 80% at 80% 70%, #013b2e 0%, transparent 50%), radial-gradient(ellipse 100% 70% at 50% 50%, #050d18 0%, transparent 30%)",
              "radial-gradient(ellipse 70% 90% at 30% 20%, #013b2e 0%, transparent 50%), radial-gradient(ellipse 90% 60% at 70% 80%, #012a20 0%, transparent 50%), radial-gradient(ellipse 80% 80% at 40% 60%, #050d18 0%, transparent 30%)",
              "radial-gradient(ellipse 90% 70% at 10% 80%, #024a3a 0%, transparent 50%), radial-gradient(ellipse 70% 100% at 90% 20%, #013b2e 0%, transparent 50%), radial-gradient(ellipse 60% 90% at 60% 40%, #050d18 0%, transparent 30%)",
              "radial-gradient(ellipse 60% 80% at 80% 60%, #012a20 0%, transparent 50%), radial-gradient(ellipse 100% 70% at 20% 90%, #024a3a 0%, transparent 50%), radial-gradient(ellipse 80% 60% at 50% 20%, #050d18 0%, transparent 30%)",
              "radial-gradient(ellipse 80% 60% at 20% 30%, #012a20 0%, transparent 50%), radial-gradient(ellipse 60% 80% at 80% 70%, #013b2e 0%, transparent 50%), radial-gradient(ellipse 100% 70% at 50% 50%, #050d18 0%, transparent 30%)"
            ]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Additional flowing layer for depth */}
        <motion.div
          className="absolute inset-0 opacity-60"
          animate={{
            background: [
              "radial-gradient(ellipse 120% 80% at 60% 40%, transparent 40%,rgb(14, 103, 57) 60%, transparent 80%), radial-gradient(ellipse 100% 120% at 40% 80%, transparent 30%, #03523e 50%, transparent 70%)",
              "radial-gradient(ellipse 100% 100% at 80% 20%, transparent 35%, #024a3a 55%, transparent 75%), radial-gradient(ellipse 80% 140% at 20% 60%, transparent 25%, #013b2e 45%, transparent 65%)",
              "radial-gradient(ellipse 140% 90% at 30% 70%, transparent 40%, #076259 60%, transparent 80%), radial-gradient(ellipse 90% 110% at 70% 30%, transparent 30%, #024a3a 50%, transparent 70%)",
              "radial-gradient(ellipse 110% 130% at 50% 90%, transparent 35%, #086b4f 55%, transparent 75%), radial-gradient(ellipse 130% 80% at 80% 50%, transparent 40%, #013b2e 60%, transparent 80%)",
              "radial-gradient(ellipse 120% 80% at 60% 40%, transparent 40%, #086b4f 60%, transparent 80%), radial-gradient(ellipse 100% 120% at 40% 80%, transparent 30%, #03523e 50%, transparent 70%)"
            ]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Subtle texture overlay */}
        <motion.div
          className="absolute inset-0 opacity-30"
          animate={{
            background: [
              "radial-gradient(ellipse 200% 100% at 0% 50%, transparent 60%, #108544 80%, transparent 100%), radial-gradient(ellipse 150% 200% at 100% 50%, transparent 50%, #0b7036 70%, transparent 90%)",
              "radial-gradient(ellipse 180% 150% at 50% 0%, transparent 65%, #03523e 85%, transparent 100%), radial-gradient(ellipse 120% 180% at 50% 100%, transparent 55%, #024a3a 75%, transparent 95%)",
              "radial-gradient(ellipse 160% 120% at 100% 0%, transparent 60%, #086b4f 80%, transparent 100%), radial-gradient(ellipse 200% 160% at 0% 100%, transparent 50%, #013b2e 70%, transparent 90%)",
              "radial-gradient(ellipse 140% 180% at 0% 0%, transparent 65%, #108544 85%, transparent 100%), radial-gradient(ellipse 180% 140% at 100% 100%, transparent 55%, #0b7036 75%, transparent 95%)",
              "radial-gradient(ellipse 200% 100% at 0% 50%, transparent 60%, #108544 80%, transparent 100%), radial-gradient(ellipse 150% 200% at 100% 50%, transparent 50%, #0b7036 70%, transparent 90%)"
            ]
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-40 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="px-4 md:px-8 py-2 md:py-4">
            <div className="flex items-center justify-center w-full">
              {/* Navigation Links */}
              <div className="bg-black/60 p-3 md:p-5 backdrop-blur-xl border border-green-500/20 rounded-xl md:rounded-2xl flex items-center space-x-4 md:space-x-12 overflow-x-auto no-scrollbar">
                <a href="#home" className="text-sm md:text-base text-gray-300 hover:text-green-400 transition-colors hover:scale-105 whitespace-nowrap">Home</a>
                <a href="#features" className="text-sm md:text-base text-gray-300 hover:text-green-400 transition-colors hover:scale-105 whitespace-nowrap">Features</a>
                <a href="#pricing" className="text-sm md:text-base text-gray-300 hover:text-green-400 transition-colors hover:scale-105 whitespace-nowrap">Pricing</a>
                <a href="#about" className="text-sm md:text-base text-gray-300 hover:text-green-400 transition-colors hover:scale-105 whitespace-nowrap">About</a>
                <a href="#contact" className="text-sm md:text-base text-gray-300 hover:text-green-400 transition-colors hover:scale-105 whitespace-nowrap">Contact</a>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Custom Cursor - Hidden on mobile */}
      <div className="hidden md:block">
        <CursorFollower />
      </div>

      {/* Hero Section */}
      <section id="home" className="h-screen flex flex-col items-center justify-center relative z-10 px-4 pt-40">
        <motion.div
          style={{ scale: titleScale, y: titleY }}
          className="text-center mb-8"
        >
          <motion.h1 
            className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-white via-green-200 to-green-700 bg-clip-text text-transparent mb-6 drop-shadow-2xl pb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            SummarifyAI
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto leading-relaxed"
            style={{ opacity: fadeOut }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            Transform your meetings into actionable insights with AI-powered summaries
          </motion.p>
        </motion.div>
        
        <motion.div 
  className="flex space-x-6"
  style={{ opacity: fadeOut }} // Assuming fadeOut is defined in your context
>
  {/* The main rectangular container for the buttons */}
  <div className="flex rounded-xl overflow-hidden border border-green-700/50 backdrop-blur-sm shadow-lg">
    <motion.a
      href="/login"
      className="px-8 py-4 flex bg-black/80 items-center justify-center font-semibold text-lg transition-all relative overflow-hidden group flex-1 min-w-[140px]"
      style={{
        backgroundColor: "rgba(34, 197, 94, 0.05)", // Very translucent green tint
        color: "rgba(255, 255, 255, 0.9)", // Light text
        borderRight: "1px solid rgba(34, 197, 94, 0.3)" // Separator between buttons
      }}
      whileHover={{ 
        backgroundColor: "rgba(1, 42, 32, 0.8)", // Darker green fill on hover
        color: "#ffffff", // Ensure text remains white
        boxShadow: "inset 0 0 0 1000px rgba(1, 42, 32, 0.8)" // Simulate fill
      }}
      whileTap={{ scale: 0.98 }}
    >
      Login
    </motion.a>
    <motion.a
      href="/signup"
      className="px-8 py-4 flex bg-black/80 items-center justify-center font-semibold text-lg transition-all relative overflow-hidden group flex-1 min-w-[140px]"
      style={{
        backgroundColor: "rgba(34, 197, 94, 0.05)", // Very translucent green tint
        color: "rgba(255, 255, 255, 0.9)", // Light text
      }}
      whileHover={{ 
        backgroundColor: "rgba(1, 59, 46, 0.8)", // Slightly different darker green fill on hover
        color: "#ffffff", // Ensure text remains white
        boxShadow: "inset 0 0 0 1000px rgba(1, 59, 46, 0.8)" // Simulate fill
      }}
      whileTap={{ scale: 0.98 }}
    >
      Sign Up
    </motion.a>
  </div>
</motion.div>
      </section>

      {/* Scrolled Content - Meeting Marquee */}
      <motion.section 
        className="relative z-10 py-40"
        style={{ 
          // Only apply fade animation on desktop (md and up)
          opacity: typeof window !== 'undefined' && window.innerWidth >= 768 ? marqueeOpacity : 1 
        }}
      >
        <div className="overflow-hidden">
          <motion.div
            className="flex"
            animate={{ x: [0, -2000] }}
            transition={{
              duration: 40,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {[...meetings, ...meetings, ...meetings].map((meeting, index) => (
              <MarqueeCard key={index} meeting={meeting} />
            ))}
          </motion.div>
        </div>
        
        <div className="overflow-hidden mt-8">
          <motion.div
            className="flex"
            animate={{ x: [-2000, 0] }}
            transition={{
              duration: 35,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {[...meetings.slice().reverse(), ...meetings.slice().reverse(), ...meetings.slice().reverse()].map((meeting, index) => (
              <MarqueeCard key={`reverse-${index}`} meeting={meeting} />
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section id="features" className="relative py-40 md:min-h-screen flex flex-col justify-center items-center overflow-hidden">
      {/* Gradient Heading */}
      <motion.h2
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="text-4xl md:text-7xl pb-2 font-bold bg-gradient-to-r from-white via-green-200 to-green-700 bg-clip-text text-transparent mb-12 md:mb-20 drop-shadow-2xl text-center px-4"
      >
        How will this help you?
      </motion.h2>

      {/* Features Container */}
      <div className="relative w-full max-w-7xl px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 pb-32 md:pb-0">
        {features.map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.2, duration: 0.6 }}
            className="relative p-10 min-h-[280px] rounded-2xl backdrop-blur-xl bg-white/5 border border-white/20 shadow-lg flex flex-col justify-between"
          >
            <div className='mb-15'>
              <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-gray-300 flex-grow">{feature.description}</p>
            </div>
            <span className="absolute mt-5 bottom-4 right-6 text-4xl font-bold text-white/30">
              {String(i + 1).padStart(2, "0")}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Animated Shapes */}
      {typeof window !== 'undefined' && window.innerWidth >= 768 && (
        <>
          <motion.div
            className="absolute bottom-10 left-10 w-20 h-20 rounded-xl backdrop-blur-xl bg-white/5 border border-white/20 shadow-lg"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
          />
          <motion.div
            className="absolute bottom-20 right-16 w-24 h-24 rounded-full backdrop-blur-xl bg-white/5 border border-white/20 shadow-lg"
            animate={{ y: [0, 20, 0] }}
            transition={{ repeat: Infinity, duration: 6 }}
          />
        </>
      )}
    </section>

      {/* Credits Section - Hidden on mobile */}
      <section ref={sectionRef} className="relative h-[100vh] hidden md:block">
  <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">

    {/* 1. Initial Text Block */}
    <motion.div
      style={{ 
        opacity: useTransform(scrollYProgress, [0, 0.25], [1, 0]),
        scale: useTransform(scrollYProgress, [0, 0.25], [1, 0.9]),
      }}
      className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 md:px-6 py-8"
    >
      {Array(4).fill("SIGN UP NOW TO GET 20 CREDITS").map((line, index) => (
        <motion.div
          key={index}
          className="w-full overflow-hidden"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <div className="whitespace-nowrap text-lg sm:text-xl md:text-3xl font-bold text-neutral-200 font-mono tracking-wide w-full text-left">
            {line}
            <span className="text-green-400 ml-2">FREE</span>
          </div>
        </motion.div>
      ))}
    </motion.div>

    {/* 2. Circular Text & Button */}
    <motion.div
      style={{
        opacity: useTransform(scrollYProgress, [0.2, 0.4], [0, 1]),
        scale: useTransform(scrollYProgress, [0.2, 0.4], [0.8, 1]),
      }}
      className="absolute inset-0 flex items-center justify-center"
    >

      {/* Outer Ring */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="absolute w-[300px] h-[300px] sm:w-[450px] sm:h-[450px] md:w-[600px] md:h-[600px] max-w-[90vw]"
      >
        <svg className="w-full h-full" viewBox="0 0 600 600">
          <defs>
            <path id="circle-outer" d="M 300, 300 m -280, 0 a 280,280 0 1,1 560,0 a 280,280 0 1,1 -560,0" />
            <linearGradient id="gradient-outer" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fff" />
              <stop offset="50%" stopColor="#86efac" />
              <stop offset="100%" stopColor="#15803d" />
            </linearGradient>
          </defs>
          <text className="text-lg font-medium fill-[url(#gradient-outer)] tracking-wider">
            <textPath href="#circle-outer" startOffset="0%">
              {"• REVOLUTIONIZE YOUR MEETINGS • AI-POWERED SUMMARIES • SAVE TIME • BOOST PRODUCTIVITY • ".repeat(2)}
            </textPath>
          </text>
        </svg>
      </motion.div>

      {/* Middle Ring */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut", delay: 0.1 }}
        className="absolute w-[200px] h-[200px] sm:w-[300px] sm:h-[300px] md:w-[400px] md:h-[400px] max-w-[70vw]"
      >
        <svg className="w-full h-full" viewBox="0 0 400 400">
          <defs>
            <path id="circle-middle" d="M 200, 200 m -180, 0 a 180,180 0 1,1 360,0 a 180,180 0 1,1 -360,0" />
            <linearGradient id="gradient-middle" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fff" />
              <stop offset="50%" stopColor="#bbf7d0" />
              <stop offset="100%" stopColor="#16a34a" />
            </linearGradient>
          </defs>
          <text className="text-base font-semibold fill-[url(#gradient-middle)] tracking-wider">
            <textPath href="#circle-middle" startOffset="0%">
              {"SIGN UP NOW TO GET 20 CREDITS FOR FREE • SUMMARIFYAI • ".repeat(2)}
            </textPath>
          </text>
        </svg>
      </motion.div>

      {/* Inner Ring */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.4, ease: "easeOut", delay: 0.2 }}
        className="absolute w-[150px] h-[150px] sm:w-[200px] sm:h-[200px] md:w-[250px] md:h-[250px] max-w-[50vw]"
      >
        <svg className="w-full h-full" viewBox="0 0 250 250">
          <defs>
            <path id="circle-inner" d="M 125, 125 m -100, 0 a 100,100 0 1,1 200,0 a 100,100 0 1,1 -200,0" />
            <linearGradient id="gradient-inner" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f0fdf4" />
              <stop offset="50%" stopColor="#dcfce7" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>
          </defs>
          <text className="text-sm font-medium fill-[url(#gradient-inner)] tracking-wide">
            <textPath href="#circle-inner" startOffset="0%">
              {"★ NO CREDIT CARD NEEDED • ".repeat(3)}
            </textPath>
          </text>
        </svg>
      </motion.div>

      {/* Sign Up Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
      >
        <motion.button
          className="bg-black/70 backdrop-blur-md border border-green-500/40 rounded-full px-5 py-2 text-white font-bold text-lg shadow-lg"
          whileHover={{ 
            scale: 1.05,
            backgroundColor: "rgba(1, 42, 32, 0.7)",
            borderColor: "rgba(34, 197, 94, 0.5)",
          }}
          whileTap={{ scale: 0.95 }}
        >
          SIGN UP NOW
        </motion.button>
      </motion.div>

    </motion.div>
  </div>
</section>

<section id="pricing" className="relative min-h-screen flex flex-col justify-center items-center overflow-hidden px-6 pt-40">
      {/* Heading */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-5xl md:text-7xl pb-2 font-bold bg-gradient-to-r from-white via-green-200 to-green-700 bg-clip-text text-transparent mb-20 drop-shadow-2xl text-center"
      >
        Simple, Transparent Pricing
      </motion.h2>

      {/* Pricing Cards */}
      <div className="relative z-10 w-full max-w-7xl grid grid-cols-1 md:grid-cols-3 gap-10">
        {pricingPlans.map((plan, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-100px 0px" }}
            transition={{ duration: 0.6, delay: i * 0.1 }}
            whileHover={{ y: -10 }}
            className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:border-green-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10 h-full flex flex-col"
          >
            {/* Plan Title */}
            <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-white to-green-400 bg-clip-text text-transparent">
              {plan.title}
            </h3>
            <p className="text-gray-300/80 mb-4 text-base font-medium">{plan.description}</p>

            {/* Price */}
            <div className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-green-400 bg-clip-text text-transparent">
              {plan.price}
              {plan.price !== 'Free' && <span className="text-base text-gray-400">/month</span>}
            </div>

            {/* Features */}
            <ul className="mb-6 space-y-3">
              {plan.features.map((feature, index) => (
                <li
                  key={index}
                  className="flex items-center gap-2 text-gray-200 text-base"
                >
                  <CheckCircle className="text-green-400 w-5 h-5 flex-shrink-0 drop-shadow-md" />
                  {feature}
                </li>
              ))}
            </ul>

            {/* Button */}
            <motion.button
              whileHover={{ 
                scale: 1.02,
                backgroundColor: "rgba(1, 42, 32, 0.7)",
                borderColor: "rgba(34, 197, 94, 0.5)",
              }}
              whileTap={{ scale: 0.98 }}
              className={`w-full py-3 rounded-full border ${
                plan.title === 'Pro Plan' 
                  ? 'bg-green-600/80 hover:bg-green-600 border-green-500/50' 
                  : 'bg-black/60 border-green-500/30'
              } text-white font-semibold text-base backdrop-blur-lg transition-all`}
            >
              {plan.button}
            </motion.button>
          </motion.div>
        ))}
      </div>
      </section>

      {/* About the Extension Section */}
      <section id="about" className="relative pt-40 pb-20 overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white via-green-200 to-green-700 bg-clip-text text-transparent mb-8 drop-shadow-2xl">
              About the Extension
            </h2>
            <p className="text-xl text-gray-300 leading-relaxed mb-10">
              SummarizeAI is a powerful browser extension that transforms your meeting experience by providing real-time, AI-powered summaries of your Google Meet, Zoom, and Microsoft Teams calls.
            </p>
            <motion.button
              whileHover={{ 
                scale: 1.02,
                backgroundColor: "rgba(1, 42, 32, 0.7)",
                borderColor: "rgba(34, 197, 94, 0.5)",
              }}
              whileTap={{ scale: 0.98 }}
              className="px-10 py-4 rounded-full bg-green-600/80 hover:bg-green-600 border border-green-500/50 text-white font-semibold text-lg backdrop-blur-lg transition-all"
            >
              Get the Extension
            </motion.button>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-10 mt-16">
            {[
              {
                title: "Seamless Integration",
                description: "Works effortlessly with all major video conferencing platforms. No setup required - just install and start your meeting."
              },
              {
                title: "AI-Powered Summaries",
                description: "Our advanced AI analyzes and condenses hours of meeting content into clear, actionable summaries in seconds."
              },
              {
                title: "Secure & Private",
                description: "Your data stays yours. We use end-to-end encryption and never store your meeting content without permission."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:border-green-500/30 transition-all"
              >
                <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-white to-green-400 bg-clip-text text-transparent">
                  {feature.title}
                </h3>
                <p className="text-gray-300/80">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Us Section */}
      <section id="contact" className="relative pt-40 pb-32 overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-left"
            >
              <h2 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white via-green-200 to-green-700 bg-clip-text text-transparent mb-6 drop-shadow-2xl">
                Contact Us
              </h2>
              <p className="text-xl text-gray-300 leading-relaxed mb-8">
                Have questions or feedback? We'd love to hear from you. Reach out and our team will get back to you as soon as possible.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Email us at</p>
                    <p className="text-white font-medium">hello@summarizeai.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Chat with us</p>
                    <p className="text-white font-medium">Live Chat Support</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10"
            >
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                    <input
                      type="text"
                      id="name"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                    <input
                      type="email"
                      id="email"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">Subject</label>
                  <input
                    type="text"
                    id="subject"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent"
                    placeholder="How can we help?"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">Message</label>
                  <textarea
                    id="message"
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent mb-4"
                    placeholder="Your message here..."
                  />
                </div>
                <div className="flex justify-end">
                  <motion.button
                    type="submit"
                    whileHover={{ 
                      scale: 1.02,
                      backgroundColor: "rgba(1, 42, 32, 0.7)",
                      borderColor: "rgba(34, 197, 94, 0.5)",
                    }}
                    whileTap={{ scale: 0.98 }}
                    className="px-8 py-3 rounded-full bg-green-600/80 hover:bg-green-600 border border-green-500/50 text-white font-semibold text-base backdrop-blur-lg transition-all"
                  >
                    Send Message
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Add smooth scrolling behavior for anchor links
if (typeof window !== 'undefined') {
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((anchor: HTMLAnchorElement) => {
    anchor.addEventListener('click', (e: MouseEvent) => {
      e.preventDefault();
      const targetId = anchor.getAttribute('href');
      if (!targetId || targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

export default Home;