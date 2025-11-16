// Common types
export interface SocialLink {
  name: string;
  links: string;
}

// Expertise types
export interface Expertise {
  id: string;
  slug: string;
  href: string;
  title: string;
  subtitle: string;
  imgHome: string;
  description: string;
}

export interface ExpertiseFrontmatter {
  id?: string;
  slug?: string;
  title: string;
  description: string;
  imgHome?: string;
  imgUrl?: string;
}

// Blog types
export interface BlogPost {
  id: string;
  title: string;
  date: string;
  category: string;
  thumb: string;
  subtitle: string | null;
  description: string | null;
  tags: string[];
  contentHtml?: string;
}

export interface BlogFrontmatter {
  title: string;
  date: string;
  category: string;
  thumb: string;
  subtitle?: string;
  description?: string;
  tags?: string[];
}

// Portfolio types (réexportés depuis portfolioDataUtils)
export type { PortfolioItem, PortfolioItemMetadata } from '../lib/portfolioDataUtils'

// Component props types
export interface SEOProps {
  title?: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
}

export interface CtaProps {
  title: string;
  btnText?: string;
  btnLink?: string;
  bgSrc: string;
  variant?: string;
}

export interface ButtonProps {
  btnLink: string;
  btnText: string;
  variant?: string;
  icon?: string;
  isExternal?: boolean;
}

export interface HeroProps {
  title: string;
  subtitle: string;
  socialLinksHeading?: string;
  heroSocialLinks?: SocialLink[];
  bgImageUrl: string;
}

export interface PageHeadingProps {
  title: string;
  bgSrc: string;
  pageLinkText: string;
}

export interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  btnLink?: string;
  btnText?: string;
  variant?: string;
  children?: React.ReactNode;
  intro?: string;
}

export interface ServiceListProps {
  expertises: Expertise[];
}

export interface SidebarProps {
  allPostsData: BlogPost[];
}
