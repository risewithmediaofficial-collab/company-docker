import React from 'react';

export const BrandWordmark = ({ spaced = false, className = '' }) => (
  <span className={className}>
    Agency{spaced ? ' ' : ''}
    <span className="text-[#07c8f9]">Upscale</span>
  </span>
);

export const renderBrandText = (text) => {
  if (typeof text !== 'string') return text;
  const parts = text.split(/(Agency\s*Up[Ss]cale)/g);
  if (parts.length === 1) return text;
  return parts.map((part, idx) => {
    const match = part.match(/^Agency(\s*)(Up[Ss]cale)$/);
    if (!match) return part;
    return (
      <React.Fragment key={idx}>
        Agency{match[1]}
        <span className="text-[#07c8f9]">{match[2]}</span>
      </React.Fragment>
    );
  });
};
