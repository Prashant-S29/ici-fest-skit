import { Button } from "@/components/ui";
import React from "react";

import Marquee from "react-fast-marquee";

const About: React.FC = () => {
  return (
    <div className="min-h-screen w-full px-[50px] pt-[150px]">
      <div className="mx-auto flex w-fit flex-col items-center">
        <h1 className="text-center text-[48px] font-extrabold uppercase leading-tight">
          ICI <span data-highlighted-text>Fest</span>
        </h1>
        <div className="h-1 w-[80%] rounded-full bg-primary" />
      </div>

      <p className="mt-4 px-[250px] text-center text-base font-medium">
        The ICI Fest has a special mission: To inspire young minds to show off
        their skills and go up against others by joining different technical,
        non technical events and workshops. Don&apos;t wait - register today to
        make yourself really stand out, even when faced with challenges. This
        Fest is all about energetic and excited people coming together. When you
        register, you&apos;re taking a step towards an awesome chance.
        You&apos;ll get to be part of cool events and workshops that are all
        about technology. Plus, you can test your abilities and see how you do
        compared to others. Imagine being in a place where everyone is
        enthusiastic and ready to share their ideas. That&apos;s what this Fest
        is about - lots of people who are excited and full of energy. So why not
        be a part of it? Join now and get ready to shine bright among the rest.
      </p>
      <div className="mt-4 flex items-center justify-center gap-5">
        <Button variant="default" size="lg" className="font-semibold">
          Register Now
        </Button>
        {/* <Button variant="outline" size="lg" className="font-semibold">
          Core Team
        </Button> */}
      </div>

      <div className="mt-5">
        <ImageSlider />
      </div>

      <div className="mx-auto mt-[50px] flex w-fit flex-col items-center">
        <h1 className="text-center text-[48px] font-extrabold uppercase leading-tight">
          About <span data-highlighted-text>SKIT</span>
        </h1>
        <div className="h-1 w-[80%] rounded-full bg-primary" />
      </div>
      <p className="mt-4 px-[250px] text-center text-base font-medium">
        Swami Keshvanand Institute of Technology, Management & Gramothan (SKIT)
        has established itself as a premier institution for engineering and
        technology education in Jaipur since its inception in 2000. In 2024 SKIT
        is now recognized as an autonomous institute by UGC-NEW DELHI As it
        proudly celebrates its 25th anniversary in 2024, SKIT is renowned for
        its commitment to innovation and academic excellence, offering a range
        of programs designed to meet the evolving demands of the industry.
        Equipped with modern facilities and dedicated research centers, SKIT
        enhances industry exposure through collaborations with leading tech
        companies, providing students with valuable practical skills.
      </p>

      <div className="mt-4 grid grid-cols-4 gap-2">
        {Array(4)
          .fill(0)
          .map((_, index) => (
            <div
              key={index}
              className="h-[200px] w-full rounded-lg bg-gray-200 object-cover duration-300"
            />
          ))}
      </div>
    </div>
  );
};

const ImageSlider: React.FC = () => {
  return (
    <Marquee speed={50} gradient={true}>
      {Array(10)
        .fill(0)
        .map((_, index) => (
          <div
            key={index}
            className="mx-1 h-[200px] w-[350px] rounded-lg bg-gray-200 object-cover duration-300"
          />
        ))}
    </Marquee>
  );
};

export default About;
