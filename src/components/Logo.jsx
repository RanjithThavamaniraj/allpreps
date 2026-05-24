
/**
 * LogoIcon - Just the icon representation of Concept 4 (Terminal/Chevron A with Base)
 */
export function LogoIcon({ className = '', size = 32 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      {/* Base Plate (Indigo #4F46E5) with perspective */}
      <path 
        d="M 20 76 L 50 92 L 80 70 L 52 62 Z" 
        fill="#4F46E5" 
      />
      {/* Left Leg (Primary Blue #2563EB) */}
      <path 
        d="M 12 74 L 46 8 L 60 8 L 26 74 Z" 
        fill="#2563EB" 
      />
      {/* Chevron Right (Muted/Text #F8FAFC) */}
      <path 
        d="M 50 14 L 84 45 L 50 76" 
        stroke="#F8FAFC" 
        strokeWidth="12" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
    </svg>
  );
}

/**
 * Logo - The full logo including the Icon and text "AllPreps"
 */
export default function Logo({ className = '', iconSize = 24 }) {
  return (
    <div 
      className={`logo-wrap ${className}`} 
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px',
        fontWeight: 800,
        fontSize: '1.25rem',
        color: 'var(--text-primary)',
        letterSpacing: '-0.025em'
      }}
    >
      <LogoIcon size={iconSize} />
      <span>AllPreps</span>
    </div>
  );
}
