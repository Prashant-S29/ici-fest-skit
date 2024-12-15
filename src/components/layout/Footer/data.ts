// icons
import { FooterIcons, SocialIcons } from "@/icons";

// types
import type { FooterDataType } from "@/types";

export const FooterData: FooterDataType[] = [
  {
    category: "Quick Links",
    icon: FooterIcons.LinkIcon,
    links: [
      {
        label: "Home",
        href: "/",
      },
      {
        label: "About",
        href: "/",
      },
      {
        label: "Gallery",
        href: "/",
      },
      {
        label: "Events",
        href: "/",
      },
    ],
  },
  {
    category: "Socials",
    icon: FooterIcons.GlobeIcon,
    links: [
      {
        label: "Instagram",
        href: "/",
      },
      {
        label: "Youtube",
        href: "/",
      },
      {
        label: "icifest@skit.ac.in",
        href: "/",
      },
    ],
  },
  {
    category: "Help &  Query",
    icon: SocialIcons.CallIcon,
    links: [
      {
        label: "Saarthak Chopra -  +91 9571285091",
        href: "/",
      },
      {
        label: "Uday Singh Sisodia -  +91 7733917219",
        href: "/",
      },
      {
        label: "Puneet Dadheech -  +91 8619106882",
        href: "/",
      },
      {
        label: "Nupur Agarwal -  +91 8209753424",
        href: "/",
      },
    ],
  },
];
