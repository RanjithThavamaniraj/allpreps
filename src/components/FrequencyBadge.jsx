import { getFrequencyBadges } from '../lib/questionMeta';

export default function FrequencyBadge({ question, compact = false }) {
  const badges = getFrequencyBadges(question);
  if (!badges.length) return null;

  return (
    <>
      {badges.map(b => (
        <span key={b.label} className={`freq-badge ${b.className}${compact ? ' freq-badge-compact' : ''}`}>
          <span className="freq-badge-emoji" aria-hidden="true">{b.emoji}</span>
          {!compact && <span>{b.label}</span>}
        </span>
      ))}
    </>
  );
}
