import React from 'react';

const HeroPattern = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      <div
        className="w-full h-full relative"
        style={{
          background:
            'linear-gradient(to bottom, #fff 0%, #fff 25%, rgba(255, 255, 255, 0) 100%), linear-gradient(to right, #0ed2da, #5f29c7)',
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(90deg, #ccc 1px, transparent 1px)',
            backgroundSize: '50px 100%',
            maskImage:
              'linear-gradient(to bottom, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0) 85%)',
            WebkitMaskImage:
              'linear-gradient(to bottom, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0) 85%)',
          }}
        />
      </div>
    </div>
  );
};

export default HeroPattern;
