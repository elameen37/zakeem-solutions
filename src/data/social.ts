export interface SocialLink {
  platform: string;
  url: string;
  handle: string;
  icon: string;
}

export const SOCIAL_LINKS: SocialLink[] = [
  {
    platform: "LinkedIn",
    url: "https://www.linkedin.com/company/zakeem-solutions",
    handle: "zakeem-solutions",
    icon: "Linkedin"
  },
  {
    platform: "X / Twitter",
    url: "https://x.com/zakeemsolutions",
    handle: "@zakeemsolutions",
    icon: "Twitter"
  },
  {
    platform: "WhatsApp",
    url: "https://wa.me/2348000000000",
    handle: "Enterprise Sales Support",
    icon: "MessageSquare"
  },
  {
    platform: "GitHub",
    url: "https://github.com/zakeem-solutions",
    handle: "zakeem-solutions",
    icon: "Github"
  }
];

export const COMPANY_CONTACT = {
  phone: "+234 (0) 800 ZAKEEM",
  email: "contact@zakeemsolutions.com",
  salesEmail: "sales@zakeemsolutions.com",
  supportEmail: "support@zakeemsolutions.com",
  address: "Abuja / Lagos, Nigeria",
  hours: "Monday – Friday: 08:00 – 18:00 WAT"
};
