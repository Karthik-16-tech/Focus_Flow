import { useState, useRef, useEffect, type ReactNode } from "react";
import {
  Trophy,
  FileText,
  User,
  ArrowRight,
  Calendar,
  Clock,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export type Achievement = {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  time: string;
  badgeType: "winner" | "place" | "medal";
  badgeText?: string;
  colorScheme: "gold" | "blue";
};

export const defaultAchievements: Achievement[] = [
  {
    id: "hackathon-2026",
    title: "Hackathon 2026",
    subtitle: "Winner",
    date: "12 Oct 2026",
    time: "4:30 PM",
    badgeType: "winner",
    badgeText: "W",
    colorScheme: "gold",
  },
  {
    id: "coding-challenge",
    title: "Coding Challenge",
    subtitle: "1st Place",
    date: "08 Oct 2026",
    time: "2:15 PM",
    badgeType: "place",
    badgeText: "1",
    colorScheme: "blue",
  },
];

export interface ActionCapsuleProps {
  variant: "gold" | "blue" | "purple" | "green";
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  ariaLabel?: string;
  className?: string;
  children?: ReactNode;
}

export function ActionCapsule({
  variant,
  icon: Icon,
  label,
  onClick,
  ariaLabel,
  className = "",
  children,
}: ActionCapsuleProps) {
  return (
    <div className={`ff-capsule-wrapper ${className}`}>
      <button
        type="button"
        className={`ff-action-capsule ff-action-capsule--${variant}`}
        onClick={onClick}
        aria-label={ariaLabel || label}
      >
        <span className={`ff-capsule-icon-wrap ff-capsule-icon-wrap--${variant}`}>
          <Icon strokeWidth={2.2} />
        </span>
        <span className="ff-capsule-label">{label}</span>
        <ArrowRight className="ff-capsule-arrow" strokeWidth={2.2} />
      </button>
      {children}
    </div>
  );
}

export interface AchievementsCapsuleProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onViewAll: () => void;
  achievements?: Achievement[];
}

export function AchievementsCapsule({
  isOpen,
  onToggle,
  onClose,
  onViewAll,
  achievements = defaultAchievements,
}: AchievementsCapsuleProps) {
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const recentAchievements = achievements.slice(0, 2);

  return (
    <div className="ff-capsule-wrapper" ref={popoverRef}>
      <button
        type="button"
        className={`ff-action-capsule ff-action-capsule--gold${isOpen ? " is-active" : ""}`}
        onClick={onToggle}
        aria-label="Achievements"
        aria-expanded={isOpen}
      >
        <span className="ff-capsule-icon-wrap ff-capsule-icon-wrap--gold">
          <Trophy strokeWidth={2.2} />
        </span>
        <span className="ff-capsule-label">Achievements</span>
        <ArrowRight className="ff-capsule-arrow" strokeWidth={2.2} />
      </button>

      {isOpen && (
        <div
          className="ff-achievements-popover"
          role="dialog"
          aria-label="Recent Achievements"
        >
          <div className="ff-popover-header">
            <div className="ff-popover-title-wrap">
              <span className="ff-popover-trophy">
                <Trophy strokeWidth={2.2} />
              </span>
              <h3 className="ff-popover-title">Recent Wins</h3>
            </div>
            <button
              type="button"
              className="ff-popover-viewall"
              onClick={onViewAll}
            >
              <span>View All</span>
              <ArrowRight strokeWidth={2.2} />
            </button>
          </div>

          {recentAchievements.length > 0 ? (
            <div className="ff-popover-list">
              {recentAchievements.map((item) => (
                <div key={item.id} className="ff-popover-item">
                  <div className="ff-popover-item-left">
                    {item.badgeType === "winner" ? (
                      <div
                        className="ff-popover-badge ff-popover-badge--gold"
                        aria-hidden="true"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="size-5"
                          fill="none"
                          stroke="currentColor"
                        >
                          <circle
                            cx="12"
                            cy="8"
                            r="6"
                            fill="#f59e0b"
                            fillOpacity="0.25"
                            stroke="#d97706"
                            strokeWidth="1.6"
                          />
                          <path
                            d="M8.21 13.89L7 22l5-3 5 3-1.21-8.11"
                            stroke="#dc2626"
                            fill="#ef4444"
                            fillOpacity="0.9"
                            strokeWidth="1.2"
                          />
                          <text
                            x="12"
                            y="10.5"
                            textAnchor="middle"
                            fontSize="7.5"
                            fontWeight="800"
                            fill="#b45309"
                            stroke="none"
                          >
                            W
                          </text>
                        </svg>
                      </div>
                    ) : (
                      <div
                        className="ff-popover-badge ff-popover-badge--blue"
                        aria-hidden="true"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="size-5"
                          fill="none"
                          stroke="currentColor"
                        >
                          <circle
                            cx="12"
                            cy="14"
                            r="6.5"
                            fill="#e0e7ff"
                            stroke="#6366f1"
                            strokeWidth="1.6"
                          />
                          <path
                            d="M7.5 2h9l-1.8 6.5H9.3L7.5 2z"
                            stroke="#4f46e5"
                            fill="#818cf8"
                            fillOpacity="0.85"
                            strokeWidth="1.2"
                          />
                          <text
                            x="12"
                            y="16.5"
                            textAnchor="middle"
                            fontSize="8"
                            fontWeight="800"
                            fill="#3730a3"
                            stroke="none"
                          >
                            2
                          </text>
                        </svg>
                      </div>
                    )}

                    <div className="ff-popover-item-details">
                      <h4 className="ff-popover-item-title">{item.title}</h4>
                      <p
                        className={`ff-popover-item-subtitle ff-popover-item-subtitle--${item.colorScheme}`}
                      >
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="ff-popover-item-meta">
                    <span>
                      <Calendar strokeWidth={2} />
                      {item.date}
                    </span>
                    <span>
                      <Clock strokeWidth={2} />
                      {item.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="ff-popover-empty">
              <span className="ff-popover-empty-icon">
                <Sparkles strokeWidth={2} className="size-5" />
              </span>
              <strong>No wins recorded yet</strong>
              <span>
                Your accomplishments will appear here as you complete challenges.
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
