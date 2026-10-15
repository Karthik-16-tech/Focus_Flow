import { Button } from '@/components/ui/button';
import { timelineSteps } from './data';

export function Timeline({
  active,
  onSelect,
  time,
}: {
  active: number;
  onSelect: (value: number) => void;
  time: string;
}) {
  return (
    <div className="timeline">
      <svg className="timeline-svg" viewBox="0 0 280 194" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="clock-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#4f6ff6" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
          <radialGradient id="face-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#edf2fe" stopOpacity="0.7" />
          </radialGradient>
        </defs>
        <path d="M 130 20 A 92 92 0 0 0 130 174" className="timeline-track-inner" />
        <path d="M 130 20 A 92 92 0 0 0 130 174" className="timeline-track" />
        <path d="M 130 20 A 92 92 0 0 0 130 174" className="timeline-rail" />
        <path d="M 130 20 A 92 92 0 0 0 130 174" className="timeline-marker" strokeDashoffset={-active * 58} />
        <circle cx="190" cy="97" r="56" className="clock-face" />
        <path d="M190 41 A56 56 0 1 1 155 141" className="clock-rim" />
        <text x="190" y="100" textAnchor="middle" className="clock-time">{time}</text>
        <text x="190" y="117" textAnchor="middle" className="clock-now">Now</text>
      </svg>
      {timelineSteps.map((step, i) => (
        <div key={step.title}>
          <span className={`timeline-label label-${i}`}>
            <strong>{step.time}</strong>{step.title}
          </span>
          <Button
            variant="ghost"
            className={`timeline-node node-${i} ${active === i ? 'active' : ''}`}
            aria-label={`Select ${step.title}`}
            aria-pressed={active === i}
            onClick={() => onSelect(i)}
          >
            {i + 1}
          </Button>
        </div>
      ))}
    </div>
  );
}
