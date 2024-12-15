"use client";

import React from "react";

// Swiper
import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

// Constants
import { YEAR } from "@/global";

// Components
import { Button } from "@/components/ui";

export const Highlights: React.FC = () => {
  return (
    <div>
      <section className="flex justify-between items-center">
        <h1 className="text-3xl font-extrabold">
          Highlights&apos;<span data-highlighted-text>{YEAR - 1}</span>
        </h1>
        <Button variant="default" size="sm" className="font-semibold">
          view all
        </Button>
      </section>
      <Swiper
        slidesPerView={2}
        spaceBetween={10}
        loop={true}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
        }}
        className="mt-2 overflow-hidden rounded-lg"
        modules={[Autoplay]}
      >
        {Array(30)
          .fill(0)
          .map((_, index) => (
            <SwiperSlide key={index}>
              <div className="h-[220px] w-full rounded-lg bg-gray-200 object-cover duration-300" />
            </SwiperSlide>
          ))}
      </Swiper>
    </div>
  );
};
