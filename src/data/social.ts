export interface SocialLink {
  platform: string;
  url: string;
  handle: string;
  icon: string;
}

export const SOCIAL_LINKS: SocialLink[] = [
  {
    platform: "LinkedIn",
    url: "https://linkedin.com/company/zakeemsolutions",
    handle: "zakeemsolutions",
    icon: "Linkedin"
  },
  {
    platform: "X",
    url: "https://x.com/zakeemsolutions",
    handle: "zakeemsolutions",
    icon: "X"
  },
  {
    platform: "Instagram",
    url: "https://instagram.com/zakeemsolutions",
    handle: "zakeemsolutions",
    icon: "Instagram"
  },
  {
    platform: "Facebook",
    url: "https://facebook.com/zakeemsolutions",
    handle: "zakeemsolutions",
    icon: "Facebook"
  },
  {
    platform: "TikTok",
    url: "https://tiktok.com/@zakeem_solutions",
    handle: "zakeem_solutions",
    icon: "TikTok"
  },
  {
    platform: "YouTube",
    url: "https://youtube.com/@zakeemsolutions",
    handle: "zakeemsolutions",
    icon: "Youtube"
  }
];

export const COMPANY_CONTACT = {
  phone: "+234 806 3291 667",
  mobile: "+234 806 3291 667",
  email: "info@zakeemsolutions.com",
  salesEmail: "sales@zakeemsolutions.com",
  supportEmail: "support@zakeemsolutions.com",
  address: "Abuja / Lagos, Nigeria",
  hours: "Monday – Friday: 08:00 – 18:00 WAT"
};
