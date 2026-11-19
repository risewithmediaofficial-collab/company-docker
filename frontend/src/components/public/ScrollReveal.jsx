import React, { useEffect, useRef, useState } from 'react';

/**
 * ScrollReveal Component
 * High-performance scroll animation that NEVER leaves the page blank:
 * - Large pre-trigger rootMargin (400px) so content is visible BEFORE scrolling into view
 * - Snappy 300ms transition with GPU hardware acceleration
 * - Instant reveal on small/mobile screens and for already-visible elements
 */
const ScrollReveal = ({ children, className = '', delay = 0 }) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(() => {
    // If mobile or reduced-motion, reveal immediately to prevent any blank flicker
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 768) return true;
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return true;
      }
    }
    return false;
  });

  useEffect(() => {
    if (isVisible) return;

    // Fallback if IntersectionObserver is unavailable
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    // Pre-check if element is already within or near the viewport
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      if (rect.top <= window.innerHeight + 300) {
        setIsVisible(true);
        return;
      }
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (ref.current) observer.unobserve(ref.current);
        }
      },
      {
        threshold: 0.01,
        // Generous 400px margin ensures content is revealed well ahead during fast scrolling
        rootMargin: '400px 0px 400px 0px',
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  return (
    <div
      ref={ref}
      style={{
        transitionDelay: `${delay}ms`,
        willChange: 'opacity, transform',
      }}
      className={`transition-all duration-300 ease-out ${
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-4'
      } ${className}`}
    >
      {children}
    </div>
  );
};

export default ScrollReveal;