import React from 'react';

/**
 * Authentic, recently updated Social Media SVG Brand Icons
 * Includes official brand shapes and colors:
 * - Instagram (Official multi-stop gradient camera)
 * - Facebook (Official Meta Facebook #1877F2 circular 'f')
 * - X / Twitter (Official modern 𝕏 logo, NOT old bird)
 * - YouTube (Official #FF0000 rectangle with white play triangle)
 * - LinkedIn (Official #0A66C2 rounded square with bold 'in')
 * - WhatsApp (Official #25D366 chat bubble with phone handset)
 * - Threads (Official @ swirl mark)
 * - TikTok (Official cyan/magenta musical note on dark)
 * - Snapchat (Official yellow ghost badge)
 * - Pinterest (Official #E60023 circular 'P')
 */

export const InstagramIcon = ({ size = 20, className = '' }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    className={`shrink-0 inline-block align-middle ${className}`}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <radialGradient id="rwm-ig-grad" cx="20%" cy="105%" r="120%">
        <stop offset="0%" stopColor="#fdf497" />
        <stop offset="10%" stopColor="#fdf497" />
        <stop offset="45%" stopColor="#fd5949" />
        <stop offset="60%" stopColor="#d6249f" />
        <stop offset="90%" stopColor="#285AEB" />
      </radialGradient>
    </defs>
    <rect x="2" y="2" width="20" height="20" rx="5.5" fill="url(#rwm-ig-grad)" />
    <rect x="4.5" y="4.5" width="15" height="15" rx="4" fill="none" stroke="#ffffff" strokeWidth="1.6" />
    <circle cx="12" cy="12" r="3.7" fill="none" stroke="#ffffff" strokeWidth="1.6" />
    <circle cx="16.5" cy="7.5" r="1.1" fill="#ffffff" />
  </svg>
);

export const FacebookIcon = ({ size = 20, className = '' }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    className={`shrink-0 inline-block align-middle ${className}`}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="11" fill="#1877F2" />
    <path
      d="M13.5 12.3h2.3l.35-2.7h-2.65V7.85c0-.75.35-1.45 1.55-1.45H16.2V4.05s-1.05-.18-2.05-.18c-2.1 0-3.45 1.25-3.45 3.55V9.6H8.3v2.7h2.4v6.85c.48.08.98.12 1.48.12.45 0 .9-.04 1.32-.1V12.3z"
      fill="#ffffff"
    />
  </svg>
);

export const XIcon = ({ size = 20, className = '' }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    className={`shrink-0 inline-block align-middle ${className}`}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="24" height="24" rx="5" fill="#000000" />
    <path
      d="M17.4 5.5h2.15l-4.7 5.37 5.53 7.63h-4.33l-3.39-4.57-3.88 4.57H6.63l5.03-5.75L6.3 5.5h4.44l3.07 4.19 3.59-4.19zm-.75 11.71h1.19L10.02 6.72H8.74l7.91 10.49z"
      fill="#ffffff"
    />
  </svg>
);

export const YouTubeIcon = ({ size = 20, className = '' }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    className={`shrink-0 inline-block align-middle ${className}`}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M23 7.5a2.8 2.8 0 0 0-1.97-1.98C19.3 5 12 5 12 5s-7.3 0-9.03.52A2.8 2.8 0 0 0 1 7.5 29.5 29.5 0 0 0 .5 12a29.5 29.5 0 0 0 .5 4.5 2.8 2.8 0 0 0 1.97 1.98C4.7 19 12 19 12 19s7.3 0 9.03-.52A2.8 2.8 0 0 0 23 16.5 29.5 29.5 0 0 0 23.5 12a29.5 29.5 0 0 0-.5-4.5z"
      fill="#FF0000"
    />
    <polygon points="9.75,15.02 15.5,12 9.75,8.98" fill="#ffffff" />
  </svg>
);

export const LinkedInIcon = ({ size = 20, className = '' }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    className={`shrink-0 inline-block align-middle ${className}`}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="24" height="24" rx="4.5" fill="#0A66C2" />
    <circle cx="7.1" cy="7.1" r="1.5" fill="#ffffff" />
    <rect x="5.6" y="9.8" width="3" height="9.2" fill="#ffffff" />
    <path
      d="M10.8 9.8h2.9v1.26h.04c.4-.77 1.4-1.58 2.87-1.58 3.07 0 3.64 2.02 3.64 4.65v5.07h-3v-4.5c0-1.07-.02-2.45-1.5-2.45-1.5 0-1.73 1.17-1.73 2.37v4.58h-3.22V9.8z"
      fill="#ffffff"
    />
  </svg>
);

export const WhatsAppIcon = ({ size = 20, className = '' }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    className={`shrink-0 inline-block align-middle ${className}`}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="11" fill="#25D366" />
    <path
      d="M17.5 14.3c-.3-.15-1.7-.85-1.95-.95-.25-.1-.45-.15-.65.15-.2.3-.75.95-.92 1.15-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.05-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.65-1.57-.9-2.15-.24-.56-.49-.48-.67-.49h-.57c-.2 0-.52.07-.8.37-.27.3-1.05 1.02-1.05 2.5 0 1.47 1.07 2.9 1.22 3.1.15.2 2.1 3.2 5.1 4.5 2.45 1.05 2.95.84 3.48.79.53-.05 1.7-.7 1.95-1.37.25-.68.25-1.26.17-1.38-.08-.12-.27-.2-.57-.35z"
      fill="#ffffff"
    />
  </svg>
);

export const ThreadsIcon = ({ size = 20, className = '' }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    className={`shrink-0 inline-block align-middle ${className}`}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="24" height="24" rx="5" fill="#000000" />
    <path
      d="M15.4 11.2c-.1-.1-.3-.2-.5-.2-.1 0-1.8 0-2.8 1-.9.9-.9 2.1-.9 2.2 0 1.2.9 2 2.1 2 1 0 1.7-.6 1.9-1.2h1.4c-.3 1.4-1.6 2.4-3.3 2.4-2 0-3.5-1.5-3.5-3.4 0-1.8 1.4-3.5 3.6-3.5 1.7 0 2.9 1 3.2 2.2.3 1.2.1 2.7-.8 3.6-.8.8-1.9 1.2-3.1 1.2-2.5 0-4.5-1.8-4.5-4.5 0-2.6 1.9-4.5 4.5-4.5 1.6 0 3 .8 3.7 2.1l-1.2.7c-.5-.9-1.4-1.5-2.5-1.5-1.8 0-3.1 1.4-3.1 3.2s1.3 3.2 3.1 3.2c1.1 0 1.8-.4 2.3-.9.5-.6.6-1.5.4-2.3-.2-.8-1-1.3-1.8-1.3z"
      fill="#ffffff"
    />
  </svg>
);

export const TikTokIcon = ({ size = 20, className = '' }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    className={`shrink-0 inline-block align-middle ${className}`}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="24" height="24" rx="5" fill="#000000" />
    <path
      d="M16.6 8.2c-1.1-.3-2-1.1-2.3-2.2h-2.1v9.8c0 1.3-1.1 2.4-2.4 2.4-1.3 0-2.4-1.1-2.4-2.4 0-1.3 1.1-2.4 2.4-2.4.3 0 .5.1.8.2v-2.2c-.3 0-.5-.1-.8-.1-2.5 0-4.6 2.1-4.6 4.6 0 2.5 2.1 4.6 4.6 4.6 2.5 0 4.6-2.1 4.6-4.6v-5.2c1 .7 2.3 1.1 3.6 1.1V9.5c-.5 0-1-.5-1.4-1.3z"
      fill="#25F4EE"
    />
    <path
      d="M17.1 7.8c-1.1-.3-2-1.1-2.3-2.2h-1.6v9.8c0 1.3-1.1 2.4-2.4 2.4-1.3 0-2.4-1.1-2.4-2.4 0-1.3 1.1-2.4 2.4-2.4.3 0 .5.1.8.2v-1.7c-.3 0-.5-.1-.8-.1-2.5 0-4.6 2.1-4.6 4.6 0 2.5 2.1 4.6 4.6 4.6 2.5 0 4.6-2.1 4.6-4.6v-5.2c1 .7 2.3 1.1 3.6 1.1V9.1c-.5 0-1-.5-1.4-1.3z"
      fill="#ffffff"
    />
    <path
      d="M17.6 7.4c-1.1-.3-2-1.1-2.3-2.2h-1.1v9.8c0 1.3-1.1 2.4-2.4 2.4-1.3 0-2.4-1.1-2.4-2.4 0-1.3 1.1-2.4 2.4-2.4.3 0 .5.1.8.2v-1.2c-.3 0-.5-.1-.8-.1-2.5 0-4.6 2.1-4.6 4.6 0 2.5 2.1 4.6 4.6 4.6 2.5 0 4.6-2.1 4.6-4.6v-5.2c1 .7 2.3 1.1 3.6 1.1V8.7c-.5 0-1-.5-1.4-1.3z"
      fill="#FE2C55"
      opacity="0.9"
    />
  </svg>
);

export const PinterestIcon = ({ size = 20, className = '' }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    className={`shrink-0 inline-block align-middle ${className}`}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="11" fill="#E60023" />
    <path
      d="M12 4.5c-4.14 0-7.5 3.36-7.5 7.5 0 3.18 1.98 5.9 4.8 6.96-.07-.58-.13-1.48.03-2.12.14-.58.94-3.98.94-3.98s-.24-.48-.24-1.19c0-1.12.65-1.95 1.46-1.95.69 0 1.02.52 1.02 1.14 0 .69-.44 1.73-.67 2.69-.19.8.4 1.46 1.19 1.46 1.43 0 2.53-1.51 2.53-3.69 0-1.93-1.39-3.28-3.37-3.28-2.47 0-3.92 1.85-3.92 3.76 0 .74.29 1.54.64 1.97.07.09.08.17.06.26-.07.28-.22.88-.25.99-.04.16-.13.2-.31.12-1.14-.53-1.85-2.2-1.85-3.54 0-2.88 2.1-5.53 6.05-5.53 3.17 0 5.64 2.26 5.64 5.28 0 3.15-1.99 5.69-4.75 5.69-1.04 0-2.02-.54-2.36-1.18l-.64 2.45c-.23.89-.86 2.01-1.28 2.7.97.3 2 .46 3.07.46 4.14 0 7.5-3.36 7.5-7.5s-3.36-7.5-7.5-7.5z"
      fill="#ffffff"
    />
  </svg>
);

export const SnapchatIcon = ({ size = 20, className = '' }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    className={`shrink-0 inline-block align-middle ${className}`}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="24" height="24" rx="5" fill="#FFFC00" />
    <path
      d="M12 5.2c-2.4 0-3.8 1.7-3.8 3.5 0 .8.2 1.7.5 2.1-.1.1-.3.2-.5.2-.2 0-.4-.1-.5-.2-.1-.1-.2-.1-.3-.1-.2 0-.4.2-.4.4 0 .3.4.6.9.7.1.4.3.9.7 1.3-.8.2-1.5.5-2.1 1-.2.2-.2.4 0 .6.3.3 1.1.5 2 .5.3 0 .7-.1 1.1-.2.4.6 1.1 1.1 2 1.1s1.6-.5 2-1.1c.4.1.8.2 1.1.2.9 0 1.7-.2 2-.5.2-.2.2-.4 0-.6-.6-.5-1.3-.8-2.1-1 .4-.4.6-.9.7-1.3.5-.1.9-.4.9-.7 0-.2-.2-.4-.4-.4-.1 0-.2 0-.3.1-.1.1-.3.2-.5.2-.2 0-.4-.1-.5-.2.3-.4.5-1.3.5-2.1 0-1.8-1.4-3.5-3.8-3.5z"
      fill="#ffffff"
      stroke="#000000"
      strokeWidth="0.75"
    />
  </svg>
);

/**
 * Universal Social Icon resolver
 * Resolves by case-insensitive name, platform code or alias
 */
export const SocialIcon = ({ name = '', platform = '', size = 20, className = '' }) => {
  const query = (name || platform || '').toLowerCase().trim();

  if (query.includes('insta') || query === 'ig') {
    return <InstagramIcon size={size} className={className} />;
  }
  if (query.includes('facebook') || query.includes('fb') || query === 'meta') {
    return <FacebookIcon size={size} className={className} />;
  }
  if (query === 'x' || query.includes('twitter') || query === 'tw') {
    return <XIcon size={size} className={className} />;
  }
  if (query.includes('youtube') || query.includes('yt') || query.includes('shorts')) {
    return <YouTubeIcon size={size} className={className} />;
  }
  if (query.includes('linkedin') || query === 'li' || query === 'in') {
    return <LinkedInIcon size={size} className={className} />;
  }
  if (query.includes('whatsapp') || query === 'wa') {
    return <WhatsAppIcon size={size} className={className} />;
  }
  if (query.includes('thread') || query === 'th') {
    return <ThreadsIcon size={size} className={className} />;
  }
  if (query.includes('tiktok') || query.includes('moj') || query.includes('josh') || query === 'tt') {
    return <TikTokIcon size={size} className={className} />;
  }
  if (query.includes('pinterest') || query === 'pn') {
    return <PinterestIcon size={size} className={className} />;
  }
  if (query.includes('snapchat') || query === 'sc') {
    return <SnapchatIcon size={size} className={className} />;
  }

  // Fallback to Instagram gradient
  return <InstagramIcon size={size} className={className} />;
};

/**
 * Clean Badge component for displaying Social Platform with real-time icon
 */
export const SocialPlatformBadge = ({
  platform = '',
  label = '',
  size = 16,
  className = '',
  selected = false,
  onClick,
}) => {
  return (
    <button
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
        selected
          ? 'bg-primary text-primary-foreground shadow-xs'
          : 'bg-slate-100 hover:bg-slate-200/80 text-slate-800 border border-slate-200'
      } ${className}`}
    >
      <SocialIcon platform={platform} size={size} />
      <span>{label || platform}</span>
    </button>
  );
};

export default SocialIcon;
