import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  RotateCcw,
  Sparkles,
  Paperclip,
  Mic,
  MicOff,
  Upload,
  Check,
  Home,
  CheckSquare,
  CalendarDays,
  MessageSquare,
  Target,
  MoreVertical,
  Layers,
  Palette,
  Sliders,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ParticleChamber } from "@/components/particle-chamber";
import { type MaterialStyle, type EnvironmentStyle } from "@/lib/particle-geometry";
import robotSketch from "@/assets/robot-sketch.jpg";
import alpineImg from "@/assets/alpine.jpg";
import { toast } from "sonner";

export function SparkleIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 56" fill="none" aria-hidden="true">
      <path
        d="M24 3C22 22 19 25 3 28C19 30 22 34 24 53C27 34 30 30 45 28C30 25 27 22 24 3Z"
        stroke="currentColor"
        strokeWidth="2.4"
      />
    </svg>
  );
}

const MATERIALS: { id: MaterialStyle; name: string; orbClass: string }[] = [
  { id: "glass", name: "Liquid Glass", orbClass: "orb-glass" },
  { id: "frost", name: "Frosted Crystal", orbClass: "orb-frost" },
  { id: "ceramic", name: "Soft Ceramic", orbClass: "orb-ceramic" },
  { id: "wire", name: "Particle Wireframe", orbClass: "orb-wire" },
];

const ENVIRONMENTS: { id: EnvironmentStyle; name: string }[] = [
  { id: "studio", name: "White Studio" },
  { id: "mist", name: "Alpine Mist" },
  { id: "alpine", name: "Snow Peaks" },
];

export function SpatialCreationStudio() {
  const navigate = useNavigate();

  // Studio 3D states
  const [material, setMaterial] = useState<MaterialStyle>("frost");
  const [environment, setEnvironment] = useState<EnvironmentStyle>("studio");
  const [exploded, setExploded] = useState(false);
  const [rotating, setRotating] = useState(true);
  const [resetKey, setResetKey] = useState(0);

  // Composer & Voice
  const [prompt, setPrompt] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Mobile drawer states
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const speechRecognitionRef = useRef<any>(null);

  // Reset handler
  const handleReset = () => {
    setMaterial("frost");
    setEnvironment("studio");
    setExploded(false);
    setRotating(true);
    setResetKey((k) => k + 1);
    toast.info("Chamber camera and simulation reset.");
  };

  // Generate trigger
  const handleGenerate = () => {
    const msg =
      "AI generation isn't connected yet. You can still explore the robot's materials and environments.";
    setToastMessage(msg);
    toast.message("Spatial Studio", {
      description: msg,
    });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Voice dictation
  const toggleListening = () => {
    if (isListening) {
      speechRecognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRec =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      toast.error("Speech recognition is not supported in this browser.");
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
        toast.info("Listening... Speak your spatial prompt");
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setPrompt((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      speechRecognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  return (
    <div className="studio">
      {/* 3D WebGL Particle Chamber Background Canvas */}
      <ParticleChamber
        material={material}
        environment={environment}
        exploded={exploded}
        rotating={rotating}
        resetKey={resetKey}
      />

      {/* Top Header matching Dashboard layout & branding */}
      <header className="ff-header">
        <div className="flex items-center gap-4">
          <Link to="/" className="ff-brand" aria-label="FocusFlow dashboard">
            <SparkleIcon />
            <span>
              Focus<span className="text-primary">Flow</span>
            </span>
          </Link>
        </div>
      </header>

      {/* Center-Top Dock Navbar matching Dashboard, Tasks, and Calendar */}
      <nav className="ff-dock" aria-label="Main navigation" data-active="3">
        <span className="ff-dock-indicator" />
        <Button
          variant="navigation"
          className="ff-nav-button"
          onClick={() => navigate({ to: "/" })}
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
          className="ff-nav-button is-active"
          aria-current="page"
        >
          <MessageSquare strokeWidth={1.8} />
          <span>Chat</span>
        </Button>
        <Button
          variant="navigation"
          className="ff-nav-button"
          onClick={() => navigate({ to: "/goals" })}
        >
          <Target strokeWidth={1.8} />
          <span>Goals</span>
        </Button>
      </nav>


      {/* Mobile Drawer Toggles */}
      <Button
        variant="glass"
        size="icon"
        className="mobile-panel-toggle"
        onClick={() => setLeftOpen((o) => !o)}
        aria-label="Toggle sketch reference panel"
      >
        <Layers className="size-4" />
      </Button>
      <Button
        variant="glass"
        size="icon"
        className="mobile-panel-toggle style-toggle"
        onClick={() => setRightOpen((o) => !o)}
        aria-label="Toggle materials and environment panel"
      >
        <Palette className="size-4" />
      </Button>

      {/* Left Floating Panel: Reference Sketch */}
      <aside className={`glass-panel left-stack ${leftOpen ? "is-open" : ""}`}>
        <div className="panel-heading">
          <h2>REFERENCE SKETCH</h2>
          <Button
            variant="ghost"
            size="icon"
            className="panel-menu"
            onClick={() => toast.info("Reference settings")}
            aria-label="Reference options"
          >
            <MoreVertical size={13} />
          </Button>
        </div>

        <div className="sketch-frame">
          <img
            src={robotSketch}
            alt="Humanoid robot concept reference sketch"
            loading="lazy"
          />
        </div>

        <div className="sketch-caption">
          <Sparkles className="size-3 text-primary shrink-0" />
          <span className="truncate">robot-sketch.jpg • Original sketch</span>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              toast.success(`Uploaded ${e.target.files[0].name} as reference.`);
            }
          }}
        />

        <Button
          variant="glass"
          className="upload-control glass-control mt-2"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload />
          <span>
            <strong>Upload Reference</strong>
            <small>JPG, PNG, WebP up to 25MB</small>
          </span>
        </Button>

        <div className="reference-info">
          <span>GPU Points: ~62K</span>
          <span>Seed: #51 PRNG</span>
        </div>
      </aside>

      {/* Right Floating Panel: Materials & Environment */}
      <aside className={`glass-panel right-stack ${rightOpen ? "is-open" : ""}`}>
        <div>
          <div className="panel-heading">
            <h2>SURFACE & FINISH</h2>
            <Sliders size={12} className="text-muted-foreground" />
          </div>

          <div className="material-grid">
            {MATERIALS.map((m) => {
              const active = material === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  className="material-card"
                  data-active={active}
                  onClick={() => {
                    setMaterial(m.id);
                    toast.success(`Applied ${m.name} finish`);
                  }}
                  aria-pressed={active}
                >
                  {active && (
                    <span className="selection-check">
                      <Check />
                    </span>
                  )}
                  <span className={`material-orb ${m.orbClass}`} />
                  <span>{m.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-2">
          <div className="panel-heading">
            <h2>ENVIRONMENT</h2>
            <span className="text-[9px] text-muted-foreground font-mono">
              {environment.toUpperCase()}
            </span>
          </div>

          <div className="environment-grid">
            {ENVIRONMENTS.map((env) => {
              const active = environment === env.id;
              return (
                <button
                  key={env.id}
                  type="button"
                  className="environment-option"
                  data-active={active}
                  onClick={() => {
                    setEnvironment(env.id);
                    toast.success(`Switched to ${env.name}`);
                  }}
                  aria-pressed={active}
                  aria-label={env.name}
                >
                  {env.id === "studio" && <div className="studio-thumbnail" />}
                  {env.id === "mist" && (
                    <img src={alpineImg} alt="Alpine Mist" className="mist" />
                  )}
                  {env.id === "alpine" && (
                    <img src={alpineImg} alt="Snow Peaks" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="environment-label">
            <span>STUDIO</span>
            <span>MIST</span>
            <span>ALPINES</span>
          </div>
        </div>
      </aside>

      {/* Bottom Zone: Tool Bar & Composer */}
      <div className="bottom-zone">
        {/* Floating Minimal Tool Bar */}
        <div className="glass-toolbar">
          <Button
            variant="ghost"
            className="tool-control"
            aria-pressed={rotating}
            onClick={() => {
              setRotating((r) => !r);
              toast.info(rotating ? "Auto-rotation paused" : "Auto-rotation resumed");
            }}
          >
            <RotateCcw className={rotating ? "text-primary animate-spin" : ""} />
            <span>{rotating ? "Rotate" : "Paused"}</span>
          </Button>

          <Button
            variant="ghost"
            className="tool-control"
            aria-pressed={exploded}
            onClick={() => {
              setExploded((e) => !e);
              toast.info(exploded ? "Reforming particle body" : "Exploding particles into orbital cloud");
            }}
          >
            <Sparkles className={exploded ? "text-primary" : ""} />
            <span>{exploded ? "Reform" : "Explode"}</span>
          </Button>

          <Button
            variant="ghost"
            className="tool-control"
            onClick={handleReset}
          >
            <RotateCcw />
            <span>Reset</span>
          </Button>
        </div>

        {/* Pill-shaped Prompt Composer */}
        <div className="composer">
          <div className="composer-mark">
            <Sparkles size={16} />
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="composer-icon"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Attach reference image"
          >
            <Paperclip size={15} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className={`composer-icon ${isListening ? "text-red-500 animate-pulse" : ""}`}
            onClick={toggleListening}
            aria-label={isListening ? "Stop speech dictation" : "Start speech dictation"}
          >
            {isListening ? <MicOff size={15} /> : <Mic size={15} />}
          </Button>

          <input
            type="text"
            placeholder="Describe spatial geometry or prompt FocusFlow AI..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleGenerate();
              }
            }}
            aria-label="Studio prompt"
          />

          <Button
            variant="generate"
            className="generate-control"
            onClick={handleGenerate}
          >
            <Send size={13} className="mr-1" />
            <span>Generate</span>
          </Button>
        </div>
      </div>

      {/* Temporary Glass Toast / Feedback */}
      {toastMessage && (
        <div className="feedback">
          <p>{toastMessage}</p>
        </div>
      )}

    </div>
  );
}
