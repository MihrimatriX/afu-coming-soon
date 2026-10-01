import React from "react";
import { CrtPage } from "@/components/templates/crt-page";
import { SOCIAL_LINKS } from "@/constants/social-links";

const TEXT = {
  title: "PEK YAKINDA",
  subtitle: "Ahmet Faruk Uzunkaya",
  tagline: "EDUCATION. GRAPHICS. CODE.",
  status: "System initializing...",
};

export default function Home() {
  return <CrtPage text={TEXT} links={SOCIAL_LINKS} />;
}
