export type SocialLinkData = {
  icon: "github" | "linkedin" | "email" | "home";
  label: string;
  url: string;
};

export const SOCIAL_LINKS: SocialLinkData[] = [
  {
    icon: "home",
    label: "ANASAYFA",
    url: "https://ahmetfuzunkaya.com",
  },
  {
    icon: "github",
    label: "GITHUB",
    url: "https://github.com/MihrimatriX",
  },
  {
    icon: "linkedin",
    label: "LINKEDIN",
    url: "https://www.linkedin.com/in/ahmet-fuzunkaya/",
  },
  {
    icon: "email",
    label: "EMAIL",
    url: "mailto:ahmet.fuzunkaya@gmail.com",
  },
];
