import React from 'react';

const HeroPattern = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      <div
        className="w-full h-full relative"
        style={{
          background:
            'linear-gradient(to bottom, #ffffff 0%, #ffffff 40%, rgba(255, 255, 255, 0) 100%), #12B7D4',
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(90deg, rgba(203, 213, 225, 0.45) 1px, transparent 1px)',
            backgroundSize: '50px 100%',
            maskImage:
              'linear-gradient(to bottom, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0) 70%)',
            WebkitMaskImage:
              'linear-gradient(to bottom, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0) 70%)',
          }}
        />
      </div>
    </div>
  );
};

export default HeroPattern;
