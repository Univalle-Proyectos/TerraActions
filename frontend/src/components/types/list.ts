import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faFacebookF,
  faInstagram,
  faTwitter,
  faYoutube,
} from '@fortawesome/free-brands-svg-icons';
import { faEnvelope } from '@fortawesome/free-regular-svg-icons';

export type NavItem = {
  id: string;
  label: string;
  href?: string; 
  icon?: IconDefinition;
  onClick?: () => void; 
};

export interface NavBarProps {
  items: NavItem[];
  logo?: string;
  logoAlt?: string;
  className?: string;
  username?: string; 
}

export const socialItems: NavItem[] = [
  {
    id: 'facebook',
    label: 'Facebook',
    href: '#',
    icon: faFacebookF,
  },
  {
    id: 'instagram',
    label: 'Instagram',
    href: '#',
    icon: faInstagram,
  },
  {
    id: 'twitter',
    label: 'Twitter',
    href: '#',
    icon: faTwitter,
  },
  {
    id: 'email',
    label: 'Email',
    href: '#',
    icon: faEnvelope,
  },
  {
    id: 'youtube',
    label: 'YouTube',
    href: '#',
    icon: faYoutube,
  },
];