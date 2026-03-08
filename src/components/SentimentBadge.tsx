interface SentimentBadgeProps {
  classification: string;
  size?: 'sm' | 'md';
}

export function SentimentBadge({ classification, size = 'sm' }: SentimentBadgeProps) {
  const colors: Record<string, string> = {
    'Extreme Fear': 'bg-extreme-fear/20 text-extreme-fear border-extreme-fear/30',
    'Fear': 'bg-fear/20 text-fear border-fear/30',
    'Neutral': 'bg-neutral/20 text-neutral border-neutral/30',
    'Greed': 'bg-greed/20 text-greed border-greed/30',
    'Extreme Greed': 'bg-extreme-greed/20 text-extreme-greed border-extreme-greed/30',
  };

  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';

  return (
    <span className={`inline-flex items-center rounded-full border font-mono ${sizeClasses} ${colors[classification] || 'bg-muted text-muted-foreground border-border'}`}>
      {classification}
    </span>
  );
}
