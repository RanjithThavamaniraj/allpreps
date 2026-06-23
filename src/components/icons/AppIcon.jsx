import { ICON_SIZES } from './sizes';

/**
 * Renders a Lucide icon at a consistent size with theme-aware currentColor.
 * @param {{ icon: import('lucide-react').LucideIcon, size?: keyof typeof ICON_SIZES | number, className?: string, strokeWidth?: number }} props
 */
export function AppIcon({
  icon: Icon,
  size = 'md',
  className = '',
  strokeWidth = 2,
  ...props
}) {
  if (!Icon) return null;

  const pixelSize = typeof size === 'number' ? size : ICON_SIZES[size] ?? ICON_SIZES.md;

  return (
    <Icon
      size={pixelSize}
      strokeWidth={strokeWidth}
      className={['app-icon', className].filter(Boolean).join(' ')}
      aria-hidden={props['aria-hidden'] ?? true}
      {...props}
    />
  );
}
