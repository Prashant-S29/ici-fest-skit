// import type { Event } from "@prisma/client";

export const data = [
  {
    slug: "innovation-summit-2024",
    dbPassword: "TechInno2024!",
    title: "Innovation Summit 2024",
    shortDescription:
      "A groundbreaking tech conference exploring the latest innovations in AI and technology.",
    description:
      "Join us for a comprehensive two-day event featuring keynote speakers, panel discussions, and networking opportunities. Dive deep into the world of cutting-edge technology and meet industry leaders from around the globe.",
    coverImage: "https://example.com/tech-conference-cover.jpg",
    category: "EVENT",
    tag: "Technology",
    images: [
      "https://example.com/tech-conf-image1.jpg",
      "https://example.com/tech-conf-image2.jpg",
      "https://example.com/tech-conf-image3.jpg",
    ],
    schedule: [
      {
        title: "Day 1 Opening Ceremony",
        date: "2024-09-15",
        startTime: 900,
        endTime: 1000,
        venue: "Main Conference Hall",
      },
      {
        title: "AI Innovation Keynote",
        date: "2024-09-15",
        startTime: 1030,
        endTime: 1200,
        venue: "Main Conference Hall",
      },
      {
        title: "Networking Lunch",
        date: "2024-09-15",
        startTime: 1230,
        endTime: 1400,
        venue: "Conference Dining Area",
      },
    ],
    durationInDays: 2,
    registrationType: "TEAM",
    registrationForm: [
      {
        title: "Individual Participant Registration",
        formURL: "https://example.com/register-individual",
        formAmount: 500,
        isActive: true,
        status: 0,
      },
      {
        title: "Team Registration",
        formURL: "https://example.com/register-team",
        formAmount: 1500,
        isActive: true,
        status: 0,
      },
    ],
    coordinators: [
      {
        name: "Sarah Johnson",
        mobile: "+1-555-123-4567",
        branch: "Event Management",
        year: 2024,
      },
      {
        name: "Michael Chen",
        mobile: "+1-555-987-6543",
        branch: "Technical Operations",
        year: 2024,
      },
    ],
    isActive: true,
    status: 1,
  },
  {
    slug: "creative-arts-workshop",
    dbPassword: "ArtWork2024#",
    title: "Creative Arts Immersion Workshop",
    shortDescription:
      "An intensive workshop for emerging artists to explore multiple creative mediums.",
    description:
      "A unique three-day workshop designed to push the boundaries of artistic expression. Participants will explore painting, digital art, sculpture, and mixed media under the guidance of renowned artists.",
    coverImage: "https://example.com/art-workshop-cover.jpg",
    category: "WORKSHOP",
    tag: "Art",
    images: [
      "https://example.com/art-workshop-image1.jpg",
      "https://example.com/art-workshop-image2.jpg",
    ],
    schedule: [
      {
        title: "Workshop Introduction",
        date: "2024-10-05",
        startTime: 1000,
        endTime: 1200,
        venue: "Art Studio A",
      },
      {
        title: "Digital Art Masterclass",
        date: "2024-10-06",
        startTime: 1400,
        endTime: 1700,
        venue: "Digital La",
      },
    ],
    durationInDays: 3,
    registrationType: "INDIVIDUAL",
    registrationForm: [
      {
        title: "Art Workshop Registration",
        formURL: "https://example.com/art-workshop-register",
        formAmount: 250,
        isActive: true,
        status: 0,
      },
    ],
    coordinators: [
      {
        name: "Elena Rodriguez",
        mobile: "+1-555-246-8101",
        branch: "Creative Arts",
        year: 2024,
      },
    ],
    isActive: true,
    status: 0,
  },
  {
    slug: "future-tech-exhibition",
    dbPassword: "FutureTech2024$",
    title: "Future Technology Exhibition",
    shortDescription:
      "A showcase of groundbreaking technological innovations from around the world.",
    description:
      "An immersive exhibition featuring cutting-edge technologies, startup innovations, and interactive demonstrations across various tech domains including AI, robotics, renewable energy, and more.",
    coverImage: "https://example.com/tech-exhibition-cover.jpg",
    category: "EXHIBITION",
    tag: "Technology",
    images: [
      "https://example.com/tech-exhibition-image1.jpg",
      "https://example.com/tech-exhibition-image2.jpg",
      "https://example.com/tech-exhibition-image3.jpg",
      "https://example.com/tech-exhibition-image4.jpg",
    ],
    schedule: [
      {
        title: "Exhibition Opening",
        date: "2024-11-15",
        startTime: 1000,
        endTime: 1100,
        venue: "Convention Cente Main Hall",
      },
      {
        title: "AI Innovation Showcase",
        date: "2024-11-15",
        startTime: 1300,
        endTime: 1500,
        venue: "Technology Pavilio",
      },
    ],
    durationInDays: 3,
    registrationType: "TEAM",
    registrationForm: [
      {
        title: "Exhibitor Registration",
        formURL: "https://example.com/exhibitor-register",
        formAmount: 1000,
        isActive: true,
        status: 0,
      },
      {
        title: "Visitor Registration",
        formURL: "https://example.com/visitor-register",
        formAmount: 50,
        isActive: true,
        status: 0,
      },
    ],
    coordinators: [
      {
        name: "David Kim",
        mobile: "+1-555-135-7910",
        branch: "Event Coordination",
        year: 2024,
      },
      {
        name: "Sophia Lee",
        mobile: "+1-555-246-8020",
        branch: "Technical Support",
        year: 2024,
      },
    ],
    isActive: true,
    status: 1,
  },
];
