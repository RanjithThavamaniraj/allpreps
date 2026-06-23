import { getFrequencyBadges } from '../lib/questionMeta';
import { AppIcon, FREQUENCY_ICON_MAP } from './icons';

export default function FrequencyBadge({ question, compact = false }) {
  const badges = getFrequencyBadges(question);
  if (!badges.length) return null;

  return (
    <>
      {badges.map(b => {
        const Icon = FREQUENCY_ICON_MAP[b.icon];
        return (
          <span key={b.label} className={`freq-badge ${b.className}${compact ? ' freq-badge-compact' : ''}`}>
            {Icon && <AppIcon icon={Icon} size="xs" className="freq-badge-icon" />}
            {!compact && <span>{b.label}</span>}
          </span>
        );
      })}
    </>
  );
}
