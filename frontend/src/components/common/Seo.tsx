import React, { useEffect } from 'react';

export interface SeoProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

export const Seo: React.FC<SeoProps> = ({
  title = 'MaidProject | Verified Home Cooks & Housemaids Booking',
  description = 'Book background-verified home cooks, housemaids, deep cleaning experts & babysitters in Bengaluru, Delhi NCR, Mumbai & Pune.',
  image = 'https://maidproject.app/og-image.png',
  url = typeof window !== 'undefined' ? window.location.href : 'https://maidproject.app',
  type = 'website',
}) => {
  useEffect(() => {
    document.title = title;

    const setMetaTag = (selector: string, attrName: string, attrValue: string, content: string) => {
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    setMetaTag('meta[name="description"]', 'name', 'description', description);
    setMetaTag('meta[property="og:title"]', 'property', 'og:title', title);
    setMetaTag('meta[property="og:description"]', 'property', 'og:description', description);
    setMetaTag('meta[property="og:image"]', 'property', 'og:image', image);
    setMetaTag('meta[property="og:url"]', 'property', 'og:url', url);
    setMetaTag('meta[property="og:type"]', 'property', 'og:type', type);
    setMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', 'MaidProject');

    setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', title);
    setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', image);

    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', url);
  }, [title, description, image, url, type]);

  return null;
};

export default Seo;
