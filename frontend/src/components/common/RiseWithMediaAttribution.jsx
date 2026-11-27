/**
 * Subtle shared attribution linking AgencyUpscale to RiseWithMedia.
 */
export const RiseWithMediaAttribution = ({ className = '', linkClassName = '' }) => (
  <span className={className}>
    A product of{' '}
    <a
      href="https://risewithmedia.com"
      target="_blank"
      rel="noopener noreferrer"
      className={`font-semibold underline underline-offset-2 transition-colors ${linkClassName}`}
    >
      risewithmedia.com
    </a>
  </span>
);

export default RiseWithMediaAttribution;
