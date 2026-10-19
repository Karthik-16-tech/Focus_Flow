import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronDown,
  CircleCheck,
  Clock3,
  Ellipsis,
  Globe2,
  Home,
  CheckSquare,
  MessageSquare,
  MapPin,
  Plus,
  Sparkles,
  Target,
  Trophy,
  UsersRound,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getDeadlineLabel } from "@/lib/deadline-countdown";

import trophyCube from "@/assets/trophy-glass.png";
import studentCubes from "@/assets/student-cubes.png";
import sustainabilityWorld from "@/assets/sustainability-world.png";
import roboticArm from "@/assets/robotic-arm.png";

function SparkleLogo() {
  return (
    <svg className="size-6 text-primary" viewBox="0 0 48 56" fill="none" aria-hidden="true">
      <path
        d="M24 3C22 22 19 25 3 28C19 30 22 34 24 53C27 34 30 30 45 28C30 25 27 22 24 3Z"
        stroke="currentColor"
        strokeWidth="2.4"
      />
    </svg>
  );
}

const featuredEvents = [
  {
    title: "Smart India Hackathon 2026",
    organizer: "Ministry of Education,\nGovernment of India",
    registration: "Oct 31, 2026",
    team: "2–6 Members",
    mode: "Hybrid",
    initiative: "Government Initiative",
    theme: "hero-sih",
  },
  {
    title: "Sustainability Innovation Hackathon",
    organizer: "Build practical ideas for a more\nsustainable future.",
    registration: "Nov 18, 2026",
    team: "2–5 Members",
    mode: "Hybrid",
    initiative: "Open Challenge",
    theme: "hero-sustainability",
  },
  {
    title: "National Level Tech Hackathon",
    organizer: "Make your next breakthrough\nwith a team of builders.",
    registration: "Dec 01, 2026",
    team: "2–4 Members",
    mode: "Online",
    initiative: "National Challenge",
    theme: "hero-technology",
  },
];

const initialProjects = [
  {
    title: "Integrated Crop Management System",
    subtitle: "Hackathon Prototype",
    preview: "crop-preview",
  },
  {
    title: "FitLoop – Fitness Tracker App",
    subtitle: "Mini Project",
    preview: "fitness-preview",
  },
];

const deadlines = [
  {
    month: "OCT",
    day: "10",
    title: "Smart India Hackathon 2026",
    kind: "Registration deadline",
    date: "2026-10-10",
    tint: "deadline-coral",
  },
  {
    month: "OCT",
    day: "25",
    title: "Global Design Challenge",
    kind: "Submission deadline",
    date: "2026-10-25",
    tint: "deadline-gold",
  },
  {
    month: "NOV",
    day: "05",
    title: "AI for Social Good Hackathon",
    kind: "Registration deadline",
    date: "2026-11-05",
    tint: "deadline-blue",
  },
  {
    month: "NOV",
    day: "20",
    title: "National Innovation Competition",
    kind: "Submission deadline",
    date: "2026-11-20",
    tint: "deadline-slate",
  },
];

const hackathons = [
  {
    title: "Student Product Hackathon",
    date: "Dec 15, 2026",
    mode: "Online",
    image: studentCubes,
    category: "card-student",
  },
  {
    title: "Sustainability Innovation Hackathon",
    date: "Nov 18, 2026",
    mode: "Hybrid",
    image: sustainabilityWorld,
    category: "card-sustainability",
  },
  {
    title: "National Level Tech Hackathon",
    date: "Dec 01, 2026",
    mode: "Online",
    image: roboticArm,
    category: "card-technology",
  },
];

type Detail = { title: string; description: string } | null;

export function GoalsDiscoveryDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(false);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [savedItems, setSavedItems] = useState<string[]>(["Smart India Hackathon 2026"]);
  const [detail, setDetail] = useState<Detail>(null);
  const [showingProjects, setShowingProjects] = useState(false);
  const [customGoals, setCustomGoals] = useState<string[]>([
    "Maintain 35-hour deep focus streak this month",
    "Submit honors research thesis proposal by Friday",
    "Master dynamic programming & graph search fundamentals",
  ]);
  const [newGoalInput, setNewGoalInput] = useState("");
  const [isAddingGoal, setIsAddingGoal] = useState(false);

  const featured = featuredEvents[featuredIndex];

  const toggleSaved = (name: string) => {
    setSavedItems((items) =>
      items.includes(name) ? items.filter((item) => item !== name) : [...items, name],
    );
  };

  const openEvent = (title: string, description: string) => setDetail({ title, description });

  const changeFeature = (offset: number) => {
    setFeaturedIndex((index) => (index + offset + featuredEvents.length) % featuredEvents.length);
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalInput.trim()) return;
    setCustomGoals((prev) => [newGoalInput.trim(), ...prev]);
    setNewGoalInput("");
    setIsAddingGoal(false);
  };

  return (
    <div className="discovery-page ff-tab-pane">
      {/* Soft Ambient Radial Washes */}
      <div className="ambient-wash ambient-wash-one" aria-hidden="true" />
      <div className="ambient-wash ambient-wash-two" aria-hidden="true" />

      {/* FocusFlow Top Header with Brand */}
      <header className="ff-header">
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard"
            className="ff-brand"
            aria-label="FocusFlow dashboard"
          >
            <SparkleLogo />
            <span>
              Focus<span className="text-primary">Flow</span>
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="ff-back-link"
            title="Return to Landing Page"
          >
            <ArrowLeft className="size-3.5" />
            <span>Landing Page</span>
          </Link>

          <div className="ff-profile-wrap">
            <Button
              variant="profile"
              className="ff-avatar"
              aria-label="Open profile menu"
              aria-expanded={profile}
              onClick={() => setProfile(!profile)}
            >
              <span className="ff-avatar-landscape" />
            </Button>
            {profile && (
              <div className="ff-profile-menu">
                <strong>Karthik</strong>
                <span>My FocusFlow space</span>
                <div className="ff-profile-divider" />
                <Link to="/" className="ff-menu-link">
                  Return to Showcase
                </Link>
                <Button variant="ghost" onClick={() => setProfile(false)}>
                  <X className="size-4" /> Close
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Center-Up Dock Navbar matching Dashboard, Tasks, Calendar, Chat, Goals */}
      <nav className="ff-dock" aria-label="Main navigation" data-active="4">
        <span className="ff-dock-indicator" />
        <Button
          variant="navigation"
          className="ff-nav-button"
          onClick={() => navigate({ to: "/dashboard" })}
        >
          <Home strokeWidth={1.8} />
          <span>Home</span>
        </Button>
        <Button
          variant="navigation"
          className="ff-nav-button"
          onClick={() => navigate({ to: "/tasks" })}
        >
          <CheckSquare strokeWidth={1.8} />
          <span>Tasks</span>
        </Button>
        <Button
          variant="navigation"
          className="ff-nav-button"
          onClick={() => navigate({ to: "/calendar" })}
        >
          <CalendarDays strokeWidth={1.8} />
          <span>Calendar</span>
        </Button>
        <Button
          variant="navigation"
          className="ff-nav-button"
          onClick={() => navigate({ to: "/chat" })}
        >
          <MessageSquare strokeWidth={1.8} />
          <span>Chat</span>
        </Button>
        <Button
          variant="navigation"
          className="ff-nav-button is-active"
          aria-current="page"
          onClick={() => navigate({ to: "/goals" })}
        >
          <Target strokeWidth={1.8} />
          <span>Goals</span>
        </Button>
      </nav>

      {/* Main Container Shell */}
      <div className="discovery-shell">

        {/* Hero Header */}
        <div className="page-intro" id="top">
          <div>
            <p className="eyebrow"><span className="live-dot" /> YOUR NEXT BIG IDEA STARTS HERE</p>
            <h1>Find your <span>next challenge.</span></h1>
            <p className="intro-copy">A little inspiration. A lot of possibility. FocusFlow challenge discovery.</p>
          </div>
          <div className="intro-meta">
            <span className="intro-meta-label">THE 2026 SEASON</span>
            <span className="intro-meta-value"><span>12</span> open opportunities</span>
          </div>
        </div>

        {/* Top Grid: Wide Featured Hero Capsule + Stacked Right Column */}
        <section className="top-grid" id="discover" aria-label="Hackathon discovery overview">
          {/* Column 1 & 2: Wide Featured Hero Capsule */}
          <article className={`featured-capsule ${featured?.theme ?? ""}`}>
            <div className="hero-reflection" />
            <div className="hero-ornament hero-ornament-one" />
            <div className="hero-ornament hero-ornament-two" />
            <div className="hero-inner">
              <div className="hero-copy">
                <div className="hero-badges">
                  <span className="featured-badge"><Sparkles size={12} /> Featured Hackathon</span>
                  <span className="initiative-badge"><Trophy size={12} /> {featured?.initiative}</span>
                </div>
                <h2>{featured?.title}</h2>
                <p className="hero-organizer">{featured?.organizer}</p>
                <div className="hero-facts">
                  <Fact icon={<CalendarDays />} label="Registration closes" value={featured?.registration ?? ""} />
                  <Fact icon={<UsersRound />} label="Team size" value={featured?.team ?? ""} />
                  <Fact icon={<MapPin />} label="Mode" value={featured?.mode ?? ""} />
                </div>
                <div className="hero-actions">
                  <Button
                    className="hero-cta"
                    onClick={() =>
                      openEvent(
                        featured?.title ?? "Hackathon",
                        `${featured?.organizer.replace("\n", " ")} · Registration closes ${featured?.registration} · Team: ${featured?.team} · Mode: ${featured?.mode}`,
                      )
                    }
                  >
                    View details <ArrowRight size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`round-action hero-save ${savedItems.includes(featured?.title ?? "") ? "is-saved" : ""}`}
                    aria-label={savedItems.includes(featured?.title ?? "") ? "Remove bookmark" : "Bookmark featured hackathon"}
                    onClick={() => toggleSaved(featured?.title ?? "")}
                  >
                    <Bookmark size={18} fill={savedItems.includes(featured?.title ?? "") ? "currentColor" : "none"} />
                  </Button>
                </div>
              </div>

              {/* 3D Visual Stage with Rotating Rings + Glass Trophy */}
              <div className="trophy-stage" aria-hidden="true">
                <span className="trophy-orbit orbit-one" />
                <span className="trophy-orbit orbit-two" />
                <img src={trophyCube} alt="3D Glass Trophy Cube" width={1024} height={1024} />
              </div>

              {/* Carousel Controls */}
              <div className="hero-carousel-controls">
                <div className="carousel-dots" aria-label={`Featured event ${featuredIndex + 1} of ${featuredEvents.length}`}>
                  {featuredEvents.map((event, index) => (
                    <button
                      key={event.title}
                      type="button"
                      aria-label={`Show ${event.title}`}
                      aria-current={featuredIndex === index}
                      className={`carousel-dot ${featuredIndex === index ? "active" : ""}`}
                      onClick={() => setFeaturedIndex(index)}
                    />
                  ))}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="round-action carousel-arrow"
                  aria-label="Previous featured hackathon"
                  onClick={() => changeFeature(-1)}
                >
                  <ArrowLeft size={17} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="round-action carousel-arrow"
                  aria-label="Next featured hackathon"
                  onClick={() => changeFeature(1)}
                >
                  <ArrowRight size={17} />
                </Button>
              </div>
            </div>
          </article>

          {/* Column 3 - Card A: Your Submitted Projects */}
          <section className="glass-panel projects-panel" aria-labelledby="projects-heading">
            <PanelHeading
              icon={<BriefcaseBusiness size={18} />}
              title="Your submitted projects"
              id="projects-heading"
              onViewAll={() => setShowingProjects(true)}
            />
            <div className="project-list">
              {initialProjects.map((project) => (
                <article className="project-row" key={project.title}>
                  <button
                    type="button"
                    className={`project-preview ${project.preview}`}
                    aria-label={`View ${project.title}`}
                    onClick={() => openEvent(project.title, `${project.subtitle} · Submitted prototype in workspace.`)}
                  >
                    <MiniAppPreview type={project.preview} />
                  </button>
                  <div className="project-copy">
                    <button
                      className="project-name"
                      onClick={() => openEvent(project.title, `${project.subtitle} · Submitted prototype in workspace.`)}
                    >
                      {project.title}
                    </button>
                    <p>{project.subtitle}</p>
                    <span className="submitted-status"><CircleCheck size={13} fill="currentColor" /> Submitted</span>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="round-action project-menu-trigger"
                        aria-label={`More options for ${project.title}`}
                      >
                        <Ellipsis size={17} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => openEvent(project.title, `${project.subtitle} · Submitted prototype.`)}>
                        View project
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => openEvent("Submission status", `${project.title} is verified & submitted for evaluation.`)}>
                        Submission status
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </article>
              ))}
            </div>
            <div className="panel-footnote">
              <span className="footnote-line" /> 2 active prototypes in your workspace
            </div>
          </section>

          {/* Column 3 - Card B: Upcoming Deadlines */}
          <section className="glass-panel deadlines-panel" id="deadlines" aria-labelledby="deadlines-heading">
            <PanelHeading
              icon={<CalendarDays size={18} />}
              title="Upcoming deadlines"
              id="deadlines-heading"
              onViewAll={() =>
                openEvent(
                  "All upcoming deadlines",
                  deadlines.map((item) => `${item.title}: ${item.kind} (${item.date})`).join("\n"),
                )
              }
            />
            <div className="deadline-list">
              {deadlines.map((item) => (
                <button
                  type="button"
                  className="deadline-row"
                  key={item.title}
                  onClick={() => openEvent(item.title, `${item.kind} · Target: ${item.date}`)}
                >
                  <span className={`deadline-date ${item.tint}`}>
                    <span>{item.month}</span>
                    <strong>{item.day}</strong>
                  </span>
                  <span className="deadline-copy">
                    <strong>{item.title}</strong>
                    <span>{item.kind}</span>
                  </span>
                  <span className={`deadline-count ${item.tint}`}>{getDeadlineLabel(item.date)}</span>
                  <ArrowUpRight className="deadline-go" size={14} />
                </button>
              ))}
            </div>
            <div className="deadline-footer"><Clock3 size={13} /> Dates update automatically</div>
          </section>
        </section>

        {/* Personal Goals Capsule Row */}
        <section className="goals-capsule-section" aria-label="Personal goals tracker">
          <div className="goals-capsule-card">
            <div className="goals-header-inline">
              <div className="flex items-center gap-2">
                <span className="goals-icon-badge"><Target size={16} /></span>
                <div>
                  <h3 className="goals-inline-title">Active Intentions & Focus Milestones</h3>
                  <p className="goals-inline-subtitle">Small steps leading to your big hackathon victories.</p>
                </div>
              </div>
              <Button
                size="sm"
                className="add-goal-inline-btn"
                onClick={() => setIsAddingGoal(true)}
              >
                <Plus size={14} /> Add new goal
              </Button>
            </div>

            <div className="goals-pills-row">
              {customGoals.map((goal, idx) => (
                <div key={idx} className="goal-pill-chip">
                  <span className="goal-pill-dot" />
                  <span className="goal-pill-text">{goal}</span>
                  <button
                    type="button"
                    className="goal-pill-remove"
                    aria-label={`Remove goal ${goal}`}
                    onClick={() => setCustomGoals((prev) => prev.filter((_, i) => i !== idx))}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Open Opportunities Cards Grid (3 Columns) */}
        <section className="opportunities-section" aria-labelledby="opportunities-heading">
          <div className="section-heading-row">
            <div>
              <p className="section-overline">MAKE SOMETHING MATTER</p>
              <h2 id="opportunities-heading">
                Open opportunities <span className="opportunity-total">03</span>
              </h2>
            </div>
            <Button
              variant="ghost"
              className="browse-button"
              onClick={() =>
                openEvent(
                  "All 2026 Opportunities",
                  "Explore 12 open hackathons, student challenges, and innovation grants for the 2026 season.",
                )
              }
            >
              Browse all <ArrowRight size={15} />
            </Button>
          </div>

          <div className="opportunity-grid">
            {hackathons.map((hackathon, index) => (
              <article
                className={`opportunity-card ${hackathon.category}`}
                key={hackathon.title}
                style={{ animationDelay: `${index * 90}ms` }}
              >
                <button
                  type="button"
                  className="opportunity-image"
                  aria-label={`Explore ${hackathon.title}`}
                  onClick={() =>
                    openEvent(
                      hackathon.title,
                      `${hackathon.date} · Mode: ${hackathon.mode} · Applications & team registrations are open now.`,
                    )
                  }
                >
                  <img src={hackathon.image} alt={hackathon.title} loading="lazy" width={1024} height={768} />
                  <span className="image-fade" />
                  <span className="hackathon-tag">Hackathon <ArrowUpRight size={11} /></span>
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`round-action card-save ${savedItems.includes(hackathon.title) ? "is-saved" : ""}`}
                  aria-label={savedItems.includes(hackathon.title) ? `Remove ${hackathon.title} bookmark` : `Bookmark ${hackathon.title}`}
                  onClick={() => toggleSaved(hackathon.title)}
                >
                  <Bookmark size={16} fill={savedItems.includes(hackathon.title) ? "currentColor" : "none"} />
                </Button>
                <div className="opportunity-info">
                  <button
                    className="opportunity-title"
                    onClick={() =>
                      openEvent(
                        hackathon.title,
                        `${hackathon.date} · Mode: ${hackathon.mode} · Applications & team registrations are open now.`,
                      )
                    }
                  >
                    {hackathon.title}
                  </button>
                  <div className="opportunity-meta">
                    <span><CalendarDays size={14} /> {hackathon.date}</span>
                    <span><Globe2 size={14} /> {hackathon.mode}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="round-action opportunity-open"
                      aria-label={`View ${hackathon.title} details`}
                      onClick={() =>
                        openEvent(
                          hackathon.title,
                          `${hackathon.date} · Mode: ${hackathon.mode} · Applications & team registrations are open now.`,
                        )
                      }
                    >
                      <ArrowRight size={16} />
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Page Footer */}
        <footer className="page-footer">
          <span>IDEAS ARE BETTER IN MOTION.</span>
          <span>DISCOVER · BUILD · SHARE</span>
        </footer>
      </div>

      {/* Interactive Detail Dialog */}
      <Dialog open={Boolean(detail)} onOpenChange={(open) => { if (!open) setDetail(null); }}>
        <DialogContent className="detail-dialog">
          <DialogHeader>
            <span className="dialog-symbol"><Sparkles size={17} /></span>
            <DialogTitle>{detail?.title}</DialogTitle>
            <DialogDescription>{detail?.description}</DialogDescription>
          </DialogHeader>
          <Button className="dialog-done" onClick={() => setDetail(null)}>
            Got it <Check size={15} />
          </Button>
        </DialogContent>
      </Dialog>

      {/* Interactive Projects Summary Dialog */}
      <Dialog open={showingProjects} onOpenChange={setShowingProjects}>
        <DialogContent className="detail-dialog projects-dialog">
          <DialogHeader>
            <span className="dialog-symbol"><BriefcaseBusiness size={17} /></span>
            <DialogTitle>Your submitted projects</DialogTitle>
            <DialogDescription>Two prototypes, already live in your workspace.</DialogDescription>
          </DialogHeader>
          <div className="dialog-project-list">
            {initialProjects.map((project) => (
              <div className="dialog-project" key={project.title}>
                <span className="dialog-project-icon"><CircleCheck size={16} /></span>
                <span>
                  <strong>{project.title}</strong>
                  <small>{project.subtitle}</small>
                </span>
                <span className="dialog-project-state">Submitted</span>
              </div>
            ))}
          </div>
          <Button className="dialog-done" onClick={() => setShowingProjects(false)}>
            Close <X size={15} />
          </Button>
        </DialogContent>
      </Dialog>

      {/* Add Custom Goal Modal */}
      <Dialog open={isAddingGoal} onOpenChange={setIsAddingGoal}>
        <DialogContent className="detail-dialog">
          <DialogHeader>
            <span className="dialog-symbol"><Target size={17} /></span>
            <DialogTitle>Add a Personal Goal</DialogTitle>
            <DialogDescription>Set a milestone or intention for your hackathon journey.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddGoal} className="flex flex-col gap-3 mt-2">
            <input
              type="text"
              className="w-full px-3 py-2 text-sm rounded-lg border border-border/80 bg-background/80 focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="e.g., Finalize pitch deck by Wednesday"
              value={newGoalInput}
              onChange={(e) => setNewGoalInput(e.target.value)}
              autoFocus
            />
            <div className="flex justify-end gap-2 mt-2">
              <Button type="button" variant="ghost" onClick={() => setIsAddingGoal(false)}>
                Cancel
              </Button>
              <Button type="submit" className="dialog-done">
                Add Goal
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Fact({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="hero-fact">
      <span className="fact-icon">{icon}</span>
      <span>
        <small>{label}</small>
        <strong>{value}</strong>
      </span>
    </div>
  );
}

function PanelHeading({
  icon,
  title,
  id,
  onViewAll,
}: {
  icon: React.ReactNode;
  title: string;
  id: string;
  onViewAll: () => void;
}) {
  return (
    <div className="panel-heading">
      <div className="panel-title-wrap">
        <span className="panel-icon">{icon}</span>
        <h2 id={id}>{title}</h2>
      </div>
      <Button variant="ghost" className="view-all-button" onClick={onViewAll}>
        View all <ArrowRight size={13} />
      </Button>
    </div>
  );
}

function MiniAppPreview({ type }: { type: string }) {
  if (type === "crop-preview") {
    return (
      <span className="mini-device-stage">
        <span className="mini-phone crop-phone">
          <span className="mini-notch" />
          <span className="mini-hello" />
          <span className="mini-crop-chart">
            <i /><i /><i /><i />
          </span>
          <span className="mini-stat-row">
            <i /><i />
          </span>
          <span className="mini-list-row">
            <i /><i />
          </span>
        </span>
        <span className="mini-phone crop-phone second-phone">
          <span className="mini-notch" />
          <span className="mini-hello" />
          <span className="mini-crop-lines">
            <i /><i /><i /><i />
          </span>
          <span className="mini-leaf-tile">
            <Sparkles size={12} />
          </span>
        </span>
        <span className="mini-preview-caption">
          FIELD NOTES <span>LIVE</span>
        </span>
      </span>
    );
  }
  return (
    <span className="mini-device-stage fitness-stage">
      <span className="mini-phone fit-phone">
        <span className="mini-notch" />
        <span className="mini-fit-title" />
        <span className="fit-ring">
          <span>82</span>
        </span>
        <span className="fit-bars">
          <i /><i /><i /><i /><i /><i />
        </span>
      </span>
      <span className="mini-phone fit-phone second-phone">
        <span className="mini-notch" />
        <span className="mini-fit-title" />
        <span className="fit-stat">
          <i /><i />
        </span>
        <span className="fit-stat">
          <i /><i />
        </span>
        <span className="fit-week">
          <i /><i /><i /><i /><i /><i /><i />
        </span>
      </span>
      <span className="mini-preview-caption">
        FITLOOP <span>82%</span>
      </span>
    </span>
  );
}
