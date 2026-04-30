"use client";

import { BookOpen } from "lucide-react";
import Image from "next/image";
import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* Floating labels config */
const floatingLabels = [
  { text: "Summarize!", top: "5%",  left: "2%",   rotate: -12, bg: "bg-emerald-400/90",  delay: 0 },
  { text: "Fast!",      top: "20%", left: "-4%",   rotate: 8,   bg: "bg-yellow-300/90",   delay: 0.15 },
  { text: "Easy!",      top: "42%", left: "-6%",   rotate: -6,  bg: "bg-pink-300/90",     delay: 0.3 },
  { text: "Accurate!",  top: "62%", left: "0%",    rotate: 10,  bg: "bg-white/90",        delay: 0.45 },
  { text: "Smart!",     top: "80%", left: "5%",    rotate: -4,  bg: "bg-emerald-300/90",  delay: 0.6 },
  { text: "Amazing!",   top: "22%", right: "-4%",  rotate: -10, bg: "bg-orange-300/90",   delay: 0.25 },
  { text: "Wow!",       top: "45%", right: "-2%",  rotate: 6,   bg: "bg-sky-300/90",      delay: 0.4 },
  { text: "Super!",     top: "65%", right: "0%",   rotate: -8,  bg: "bg-rose-300/90",     delay: 0.55 },
  { text: "Perfect!",   top: "83%", right: "5%",   rotate: 12,  bg: "bg-amber-200/90",    delay: 0.7 },
];

const HeroSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const mascotRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const labelsRef = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      /* Mascot scroll animation */
      if (mascotRef.current) {
        gsap.fromTo(
          mascotRef.current,
          { y: 0, scale: 1, rotate: 0 },
          {
            y: -80,
            scale: 1.08,
            rotate: 3,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top top",
              end: "bottom top",
              scrub: 1.2,
            },
          }
        );
      }

      /* Hero text entrance + scroll animations */
      const heroTextTl = gsap.timeline();

      if (subtitleRef.current) {
        heroTextTl.fromTo(
          subtitleRef.current,
          { opacity: 0, y: 40, filter: "blur(8px)" },
          { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.9, ease: "power2.out" },
          0.15
        );
      }

      if (headingRef.current) {
        heroTextTl.fromTo(
          headingRef.current,
          { opacity: 0, y: 60, filter: "blur(10px)" },
          { opacity: 1, y: 0, filter: "blur(0px)", duration: 1, ease: "power2.out" },
          0.35
        );
      }

      /* Scroll-out: text moves up + fades — reverses on scroll back */
      const textTargets = [subtitleRef.current, headingRef.current].filter(Boolean);
      if (textTargets.length) {
        gsap.fromTo(
          textTargets,
          { y: 0, opacity: 1 },
          {
            y: -80,
            opacity: 0,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top top",
              end: "40% top",
              scrub: true,
            },
          }
        );
      }

      /* Floating labels entrance + perpetual float */
      labelsRef.current.forEach((el, i) => {
        if (!el) return;
        const label = floatingLabels[i];

        // Entrance: fade in + slide from random direction
        gsap.fromTo(
          el,
          { opacity: 0, scale: 0.5, y: 30 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.6,
            delay: 0.4 + label.delay,
            ease: "back.out(1.7)",
          }
        );

        // Scroll parallax on labels
        gsap.to(el, {
          y: () => gsap.utils.random(-40, -80),
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 1 + i * 0.1,
          },
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative overflow-hidden h-dvh">
      <div className="relative z-10 px-6 md:px-12 lg:px-20">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2.5" aria-label="SumerizeIt Home">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/90 backdrop-blur-sm flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className={`font-alegreya-sans text-lg tracking-tight transition-colors duration-300 text-white`}>
              Sumerize<span className="text-emerald-400">It</span>
            </span>
          </a>
        </div>
      </div>

      {/* Background Image (hero only) */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/background-hero.jpg"
          alt="Mystical forest background"
          fill
          priority
          quality={90}
          className="object-cover object-center"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 flex flex-col items-center justify-between h-full max-w-7xl mx-auto px-6 md:px-12 lg:px-20 pb-0">
        {/* Hero Headline Text — centered vertically */}
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4 pt-16">
          <p ref={subtitleRef} className="text-xs sm:text-sm md:text-base uppercase tracking-[0.25em] text-emerald-300 font-semibold mb-2 sm:mb-4" style={{ opacity: 0 }}>
            It&apos;s Time to Summarize
          </p>
          <h1 ref={headingRef} className="font-aboreto text-2xl sm:text-4xl md:text-5xl lg:text-7xl text-white leading-tight" style={{ opacity: 0 }}>
            Summarize{" "}
            <span className="text-emerald-400 font-bold">Your Reading</span>
            <br />
            with Frieren!
          </h1>
        </div>

        {/* Mascot Image — pinned to bottom */}
        <div className="relative flex items-end justify-center w-full">
          <div ref={mascotRef} className="relative w-[65%] sm:w-[50%] md:w-[42%] lg:w-[35%] max-w-md aspect-square">
            <Image
              src="/images/mascot-hero.png"
              alt="SumerizeIt AI Companion"
              fill
              priority
              className="object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
            />

            {/* Floating Text Labels */}
            {floatingLabels.map((label, i) => (
              <span
                key={i}
                ref={(el) => { labelsRef.current[i] = el; }}
                className={`absolute px-2 py-0.5 sm:px-3 sm:py-1 md:px-4 md:py-1.5 rounded-full text-[10px] sm:text-xs md:text-sm font-alegreya-sans tracking-wide shadow-lg backdrop-blur-sm select-none pointer-events-none whitespace-nowrap ${label.bg} text-gray-800`}
                style={{
                  top: label.top,
                  left: label.left,
                  right: label.right,
                  transform: `rotate(${label.rotate}deg)`,
                  opacity: 0,
                }}
              >
                {label.text}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;