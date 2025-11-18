// Common types
export type SocialLink = {
  name: string;
  links: string;
}

// Expertise types
export type Expertise = {
  id: string;
  slug: string;
  href: string;
  title: string;
  subtitle: string;
  imgHome: string;
  description: string;
}

export type ExpertiseFrontmatter = {
  id?: string;
  slug?: string;
  title: string;
  description: string;
  imgHome?: string;
  imgUrl?: string;
}

// Component props types
export type SEOProps = {
  title?: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
}

export type CtaProps = {
  title: string;
  btnText?: string;
  btnLink?: string;
  bgSrc: string;
  variant?: string;
}

export type ButtonProps = {
  btnLink: string;
  btnText: string;
  variant?: string;
  icon?: string;
  isExternal?: boolean;
}

export type HeroProps = {
  title: string;
  subtitle: string;
  socialLinksHeading?: string;
  heroSocialLinks?: SocialLink[];
  bgImageUrl: string;
}

export type PageHeadingProps = {
  title: string;
  bgSrc: string;
  pageLinkText: string;
}

export type SectionHeadingProps = {
  title: string;
  subtitle?: string;
  btnLink?: string;
  btnText?: string;
  variant?: string;
  children?: React.ReactNode;
  intro?: string;
}

export type ServiceListProps = {
  expertises: Expertise[];
}
