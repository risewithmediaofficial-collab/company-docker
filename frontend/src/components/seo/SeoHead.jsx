import { useEffect } from 'react';

const SITE_URL = 'https://agencyupscale.com';
const DEFAULT_IMAGE = `${SITE_URL}/agencyupscalelogo.png`;

const upsertMeta = (attrName, attrValue, content) => {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attrName}="${attrValue}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attrName, attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
};

const upsertCanonical = (href) => {
  if (!href) return;
  let link = document.head.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
};

/**
 * Lightweight, zero-dependency SEO & Structured Data head manager.
 * Updates document title, meta description, canonical URL, robots,
 * Open Graph, Twitter Card, and page-level JSON-LD schemas.
 */
const SeoHead = ({
  title,
  description,
  canonicalPath = '/',
  noIndex = false,
  ogType = 'website',
  image = DEFAULT_IMAGE,
  jsonLd = null,
}) => {
  useEffect(() => {
    if (title) {
      document.title = title;
    }

    const canonicalUrl = canonicalPath.startsWith('http')
      ? canonicalPath
      : `${SITE_URL}${canonicalPath === '/' ? '/' : canonicalPath.replace(/\/+$/, '')}`;

    const robotsContent = noIndex ? 'noindex, nofollow' : 'index, follow';

    if (description) {
      upsertMeta('name', 'description', description);
      upsertMeta('property', 'og:description', description);
      upsertMeta('name', 'twitter:description', description);
    }

    upsertMeta('name', 'robots', robotsContent);
    upsertMeta('property', 'og:type', ogType);
    upsertMeta('property', 'og:site_name', 'Agency Upscale');
    upsertMeta('property', 'og:title', title || 'Agency Upscale | Digital Marketing & Agency CRM Software');
    upsertMeta('property', 'og:url', canonicalUrl);
    upsertMeta('property', 'og:image', image);
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', title || 'Agency Upscale | Digital Marketing & Agency CRM Software');
    upsertMeta('name', 'twitter:image', image);

    upsertCanonical(canonicalUrl);

    // Manage page-specific JSON-LD script
    const existingScript = document.head.querySelector('script[data-seo-jsonld="true"]');
    if (existingScript) {
      existingScript.remove();
    }

    if (jsonLd) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-seo-jsonld', 'true');
      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }

    return () => {
      const activeScript = document.head.querySelector('script[data-seo-jsonld="true"]');
      if (activeScript) activeScript.remove();
    };
  }, [title, description, canonicalPath, noIndex, ogType, image, jsonLd]);

  return null;
};

export default SeoHead;
