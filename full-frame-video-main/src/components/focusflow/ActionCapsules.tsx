import { useState, useRef, useEffect, type ReactNode } from "react";
import {
  Trophy,
  FileText,
  User,
  ArrowRight,
  Calendar,
  Clock,
  Sparkles,
  CheckCircle2,
  Flame,
  Award,
  Zap,
  GraduationCap,
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

// ---------------------------------------------------------------------------
// 1. Achievements Capsule (Gold) with Hover & Click Dialog
// ---------------------------------------------------------------------------
export interface AchievementsCapsuleProps {
  isOpen?: boolean;
  onToggle?: () => void;
  onClose?: () => void;
  onViewAll?: () => void;
  achievements?: Achievement[];
}

export function AchievementsCapsule({
  isOpen: controlledIsOpen,
  onToggle,
  onClose,
  onViewAll,
  achievements = defaultAchievements,
}: AchievementsCapsuleProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? (controlledIsOpen || internalOpen) : internalOpen;
  const popoverRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setInternalOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimerRef.current = setTimeout(() => {
      setInternalOpen(false);
      onClose?.();
    }, 220);
  };

  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalOpen((prev) => !prev);
    }
  };

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setInternalOpen(false);
        onClose?.();
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setInternalOpen(false);
        onClose?.();
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
    <div
      className="ff-capsule-wrapper"
      ref={popoverRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        className={`ff-action-capsule ff-action-capsule--gold${isOpen ? " is-active" : ""}`}
        onClick={handleToggle}
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
          className="ff-achievements-popover ff-action-popover"
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
            {onViewAll && (
              <button
                type="button"
                className="ff-popover-viewall"
                onClick={onViewAll}
              >
                <span>View All</span>
                <ArrowRight strokeWidth={2.2} />
              </button>
            )}
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
                        <Award className="size-4" strokeWidth={2.5} />
                      </div>
                    ) : (
                      <div
                        className="ff-popover-badge ff-popover-badge--blue"
                        aria-hidden="true"
                      >
                        <Zap className="size-4" strokeWidth={2.5} />
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

// ---------------------------------------------------------------------------
// 2. Today's To-Do Capsule (Blue) with Hover & Click Dialog
// ---------------------------------------------------------------------------
export interface TodayTodoCapsuleProps {
  onViewAll?: () => void;
  tasks?: Array<{ id: number | string; title: string; done?: boolean; time?: string }>;
}

export function TodayTodoCapsule({
  onViewAll,
  tasks = [
    { id: 1, title: "Review organic chemistry mechanisms", done: true, time: "08:30 AM" },
    { id: 2, title: "Complete algorithmic complexity problem set", done: false, time: "10:15 AM" },
    { id: 3, title: "Draft literature review introduction", done: false, time: "02:00 PM" },
  ],
}: TodayTodoCapsuleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimerRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 220);
  };

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div
      className="ff-capsule-wrapper"
      ref={popoverRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        className={`ff-action-capsule ff-action-capsule--blue${isOpen ? " is-active" : ""}`}
        onClick={() => {
          if (onViewAll) onViewAll();
          else setIsOpen((prev) => !prev);
        }}
        aria-label="Today's To-Do"
        aria-expanded={isOpen}
      >
        <span className="ff-capsule-icon-wrap ff-capsule-icon-wrap--blue">
          <FileText strokeWidth={2.2} />
        </span>
        <span className="ff-capsule-label">Today's To-Do</span>
        <ArrowRight className="ff-capsule-arrow" strokeWidth={2.2} />
      </button>

      {isOpen && (
        <div
          className="ff-action-popover"
          role="dialog"
          aria-label="Today's Tasks Preview"
        >
          <div className="ff-popover-header">
            <div className="ff-popover-title-wrap">
              <span className="ff-popover-trophy ff-popover-icon--blue">
                <FileText strokeWidth={2.2} />
              </span>
              <h3 className="ff-popover-title">Today's Tasks</h3>
            </div>
            {onViewAll && (
              <button
                type="button"
                className="ff-popover-viewall"
                onClick={onViewAll}
              >
                <span>Open Tasks</span>
                <ArrowRight strokeWidth={2.2} />
              </button>
            )}
          </div>

          <div className="ff-popover-list">
            {tasks.slice(0, 3).map((item) => (
              <div key={item.id} className="ff-popover-item">
                <div className="ff-popover-item-left">
                  <div
                    className={`ff-popover-badge ${item.done ? "ff-popover-badge--green" : "ff-popover-badge--blue"}`}
                    aria-hidden="true"
                  >
                    {item.done ? (
                      <CheckCircle2 className="size-4" strokeWidth={2.6} />
                    ) : (
                      <Clock className="size-4" strokeWidth={2.4} />
                    )}
                  </div>

                  <div className="ff-popover-item-details">
                    <h4 className="ff-popover-item-title truncate max-w-[170px]">
                      {item.title}
                    </h4>
                    <p
                      className={`ff-popover-item-subtitle ${item.done ? "ff-popover-item-subtitle--green" : "ff-popover-item-subtitle--blue"}`}
                    >
                      {item.done ? "Completed ✓" : "In Progress"}
                    </p>
                  </div>
                </div>

                <div className="ff-popover-item-meta">
                  <span>
                    <Clock strokeWidth={2} />
                    {item.time || "Today"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 3. My Profile Capsule (Purple) with Hover & Click Dialog
// ---------------------------------------------------------------------------
export interface ProfileCapsuleProps {
  onViewAll?: () => void;
}

export function ProfileCapsule({ onViewAll }: ProfileCapsuleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimerRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 220);
  };

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div
      className="ff-capsule-wrapper"
      ref={popoverRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        className={`ff-action-capsule ff-action-capsule--purple${isOpen ? " is-active" : ""}`}
        onClick={() => {
          if (onViewAll) onViewAll();
          else setIsOpen((prev) => !prev);
        }}
        aria-label="My Profile"
        aria-expanded={isOpen}
      >
        <span className="ff-capsule-icon-wrap ff-capsule-icon-wrap--purple">
          <User strokeWidth={2.2} />
        </span>
        <span className="ff-capsule-label">My Profile</span>
        <ArrowRight className="ff-capsule-arrow" strokeWidth={2.2} />
      </button>

      {isOpen && (
        <div
          className="ff-action-popover ff-action-popover--right"
          role="dialog"
          aria-label="Student Profile Preview"
        >
          <div className="ff-popover-header">
            <div className="ff-popover-title-wrap">
              <span className="ff-popover-trophy ff-popover-icon--purple">
                <User strokeWidth={2.2} />
              </span>
              <h3 className="ff-popover-title">Student Profile</h3>
            </div>
            {onViewAll && (
              <button
                type="button"
                className="ff-popover-viewall"
                onClick={onViewAll}
              >
                <span>Full Profile</span>
                <ArrowRight strokeWidth={2.2} />
              </button>
            )}
          </div>

          <div className="ff-popover-profile-card">
            <div className="ff-popover-avatar">K</div>
            <div className="flex flex-col gap-0.5">
              <h4 className="text-sm font-bold text-slate-900 leading-snug">Karthik</h4>
              <p className="text-[11.5px] font-medium text-slate-500">
                B.Tech Computer Science · Year 3
              </p>
            </div>
          </div>

          <div className="ff-popover-chips-row">
            <span className="ff-popover-chip ff-popover-chip--gold">
              <GraduationCap className="size-3.5" /> GPA: 3.92
            </span>
            <span className="ff-popover-chip ff-popover-chip--purple">
              <Flame className="size-3.5" /> 14-Day Streak
            </span>
            <span className="ff-popover-chip ff-popover-chip--green">
              <CheckCircle2 className="size-3.5" /> 94% On-time
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 4. Competitions Capsule (Green) with Hover & Click Dialog
// ---------------------------------------------------------------------------
export interface CompetitionsCapsuleProps {
  onViewAll?: () => void;
}

export function CompetitionsCapsule({ onViewAll }: CompetitionsCapsuleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimerRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 220);
  };

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const competitions = [
    {
      id: "ai-hackathon",
      title: "Global AI Hackathon 2026",
      subtitle: "$10,000 Prize Pool",
      deadline: "Closes in 4 days",
      status: "Team Registered",
      color: "green",
    },
    {
      id: "code-sprint",
      title: "National Code Sprint",
      subtitle: "National Finals #4",
      deadline: "Starts Nov 02",
      status: "Qualified",
      color: "blue",
    },
  ];

  return (
    <div
      className="ff-capsule-wrapper"
      ref={popoverRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        className={`ff-action-capsule ff-action-capsule--green${isOpen ? " is-active" : ""}`}
        onClick={() => {
          if (onViewAll) onViewAll();
          else setIsOpen((prev) => !prev);
        }}
        aria-label="Competitions"
        aria-expanded={isOpen}
      >
        <span className="ff-capsule-icon-wrap ff-capsule-icon-wrap--green">
          <Trophy strokeWidth={2.2} />
        </span>
        <span className="ff-capsule-label">Competitions</span>
        <ArrowRight className="ff-capsule-arrow" strokeWidth={2.2} />
      </button>

      {isOpen && (
        <div
          className="ff-action-popover ff-action-popover--right"
          role="dialog"
          aria-label="Active Competitions Preview"
        >
          <div className="ff-popover-header">
            <div className="ff-popover-title-wrap">
              <span className="ff-popover-trophy ff-popover-icon--green">
                <Trophy strokeWidth={2.2} />
              </span>
              <h3 className="ff-popover-title">Competitions</h3>
            </div>
            {onViewAll && (
              <button
                type="button"
                className="ff-popover-viewall"
                onClick={onViewAll}
              >
                <span>Explore All</span>
                <ArrowRight strokeWidth={2.2} />
              </button>
            )}
          </div>

          <div className="ff-popover-list">
            {competitions.map((item) => (
              <div key={item.id} className="ff-popover-item">
                <div className="ff-popover-item-left">
                  <div
                    className={`ff-popover-badge ${item.color === "green" ? "ff-popover-badge--green" : "ff-popover-badge--blue"}`}
                    aria-hidden="true"
                  >
                    <Trophy className="size-4" strokeWidth={2.4} />
                  </div>

                  <div className="ff-popover-item-details">
                    <h4 className="ff-popover-item-title truncate max-w-[170px]">
                      {item.title}
                    </h4>
                    <p
                      className={`ff-popover-item-subtitle ${item.color === "green" ? "ff-popover-item-subtitle--green" : "ff-popover-item-subtitle--blue"}`}
                    >
                      {item.subtitle}
                    </p>
                  </div>
                </div>

                <div className="ff-popover-item-meta">
                  <span>
                    <Calendar strokeWidth={2} />
                    {item.deadline}
                  </span>
                  <span className="text-emerald-600 font-bold">
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
