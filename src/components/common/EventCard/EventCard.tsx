import Image from "next/image";
import React from "react";

interface EventCardProps {
  data: {
    title: string;
    shortDescription: string;
    description: string;
    coverImage: string;
    category: string;
    tag: string;
  };
}

export const EventCard: React.FC<EventCardProps> = ({ data }) => {
  return (
    <div className="w-full overflow-hidden rounded-lg bg-white shadow-sm">
      <div className="h-[180px] w-full p-3 pb-0">
        <Image
          src="https://picsum.photos/seed/picsum/600/500"
          alt="coverImage"
          width={600}
          height={500}
          className="h-full w-full object-cover rounded-sm"
        />
      </div>
      <section className=" px-3 pb-3 mt-1">
        <p className="text-sm  font-semibold">{data.title}</p>
      </section>
    </div>
  );
};
