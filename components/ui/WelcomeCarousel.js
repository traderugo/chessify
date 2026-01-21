"use client";

import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Trophy,
  Activity,
} from "lucide-react";

export default function WelcomeCarousel({ username, greeting }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      icon: Sparkles,
      title: `${greeting}, ${username}`,
      subtitle: "Your board is set. Let’s make some history today.",
      accent: "from-indigo-500 via-blue-500 to-cyan-400",
      pill: "Welcome back",
    },
    {
      icon: Trophy,
      title: "Autumn Grand Prix 2026",
      subtitle: "Registration is live. Sharpen your openings.",
      accent: "from-amber-400 via-orange-500 to-rose-500",
      pill: "₦5,000,000 Prize Pool • Jan 20",
    },
    {
      icon: Activity,
      title: "Live Analysis Tonight",
      subtitle: "Grandmaster breakdowns at 8 PM WAT.",
      accent: "from-emerald-400 via-teal-500 to-cyan-500",
      pill: "Rapid Championship Recap",
    },
  ];

  const nextSlide = () =>
    setCurrentSlide((prev) => (prev + 1) % slides.length);

  const prevSlide = () =>
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  useEffect(() => {
    const interval = setInterval(nextSlide, 7000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="px-4 sm:px-6 pt-4">
      {/* MATCHES PAGE WIDTH — NOT FULL SCREEN */}
      <div className="relative max-w-6xl mx-auto">
        <div className="relative h-32 sm:h-40 md:h-44 rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0f1115]">
          {slides.map((slide, index) => {
            const Icon = slide.icon;

            return (
              <div
                key={index}
                className={`absolute inset-0 transition-all duration-700 ease-out ${
                  index === currentSlide
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 translate-x-6 pointer-events-none"
                }`}
              >
                {/* GRADIENT STRIPE */}
                <div
                  className={`absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b ${slide.accent}`}
                />

                <div className="relative h-full px-6 sm:px-8 py-5 sm:py-6 flex flex-col justify-center">
                  {/* ICON + PILL */}
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`p-2 rounded-lg bg-gradient-to-br ${slide.accent} text-white shadow`}
                    >
                      <Icon size={18} />
                    </div>

                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-200">
                      {slide.pill}
                    </span>
                  </div>

                  {/* TITLE */}
                  <h2 className="text-xl ml-5 sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                    {slide.title}
                  </h2>

                  {/* SUBTITLE */}
                  <p className="mt-1.5 ml-5 text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-2xl">
                    {slide.subtitle}
                  </p>
                </div>
              </div>
            );
          })}

          {/* NAV BUTTONS */}
          <button
            onClick={prevSlide}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 dark:bg-black/40 backdrop-blur hover:scale-110 transition shadow"
            aria-label="Previous"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 dark:bg-black/40 backdrop-blur hover:scale-110 transition shadow"
            aria-label="Next"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* DOTS */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-1.5 rounded-full transition-all ${
                  index === currentSlide
                    ? "w-6 bg-gray-900 dark:bg-white"
                    : "w-2 bg-gray-400/60 hover:bg-gray-500"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
