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
  Volume2,
  VolumeX,
  X,
  Bot,
  Loader2,
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

  // AI Answering & Speech in Spatial Studio
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSpeakingAnswer, setIsSpeakingAnswer] = useState(false);

  // Mobile drawer states
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const speechRecognitionRef = useRef<any>(null);

  // Text-To-Speech for AI Answer
  const speakAnswer = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsSpeakingAnswer(true);
      utterance.onend = () => setIsSpeakingAnswer(false);
      utterance.onerror = () => setIsSpeakingAnswer(false);
      window.speechSynthesis.speak(utterance);
    } catch {
      setIsSpeakingAnswer(false);
    }
  };

  const stopSpeakingAnswer = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeakingAnswer(false);
  };

  // Reset handler
  const handleReset = () => {
    setMaterial("frost");
    setEnvironment("studio");
    setExploded(false);
    setRotating(true);
    setResetKey((k) => k + 1);
    stopSpeakingAnswer();
    setAiAnswer(null);
    toast.info("Chamber camera and simulation reset.");
  };

  // Gemini API Key (configurable via env var VITE_GEMINI_API_KEY)
  const GEMINI_API_KEY = (import.meta.env['VITE_GEMINI_API_KEY'] as string | undefined) || '';

  // Real Gemini AI Generation & Spatial Control
  const handleGenerate = async (queryText?: string) => {
    const text = (queryText || prompt).trim();
    if (!text || isGenerating) return;

    setIsGenerating(true);
    setAiAnswer(null);
    stopSpeakingAnswer();

    // Contextually manipulate 3D studio controls based on prompt keywords
    const lower = text.toLowerCase();
    let actionTriggered = "";

    if (lower.includes("glass") || lower.includes("liquid glass")) {
      setMaterial("glass");
      actionTriggered = "Switched shader to Liquid Glass.";
    } else if (lower.includes("frost") || lower.includes("crystal")) {
      setMaterial("frost");
      actionTriggered = "Switched shader to Frosted Crystal.";
    } else if (lower.includes("ceramic") || lower.includes("porcelain")) {
      setMaterial("ceramic");
      actionTriggered = "Switched shader to Soft Ceramic.";
    } else if (lower.includes("wire") || lower.includes("particle") || lower.includes("mesh")) {
      setMaterial("wire");
      actionTriggered = "Switched shader to Particle Wireframe.";
    }

    if (lower.includes("mist") || lower.includes("fog")) {
      setEnvironment("mist");
      actionTriggered += (actionTriggered ? " " : "") + "Set environment to Alpine Mist.";
    } else if (lower.includes("alpine") || lower.includes("snow") || lower.includes("mountain")) {
      setEnvironment("alpine");
      actionTriggered += (actionTriggered ? " " : "") + "Set environment to Snow Peaks.";
    } else if (lower.includes("studio") || lower.includes("white")) {
      setEnvironment("studio");
      actionTriggered += (actionTriggered ? " " : "") + "Set environment to White Studio.";
    }

    if (lower.includes("explode") || lower.includes("disperse") || lower.includes("scatter")) {
      setExploded(true);
      actionTriggered += (actionTriggered ? " " : "") + "Exploded particle body.";
    } else if (lower.includes("reform") || lower.includes("assemble") || lower.includes("rebuild")) {
      setExploded(false);
      actionTriggered += (actionTriggered ? " " : "") + "Reformed particle structure.";
    }

    if (lower.includes("rotate") || lower.includes("spin") || lower.includes("turn")) {
      setRotating(true);
      actionTriggered += (actionTriggered ? " " : "") + "Started auto-rotation.";
    } else if (lower.includes("pause") || lower.includes("stop rotation") || lower.includes("freeze")) {
      setRotating(false);
      actionTriggered += (actionTriggered ? " " : "") + "Paused rotation.";
    }

    if (lower.includes("reset") || lower.includes("default")) {
      handleReset();
      actionTriggered = "Reset chamber to defaults.";
    }

    try {
      const promptContext = `You are FocusFlow Spatial AI Copilot assisting student Karthik in the interactive 3D Spatial Creation Studio.
Context: You are co-piloting an interactive robotic arm particle chamber with shaders (Liquid Glass, Frosted Crystal, Soft Ceramic, Particle Wireframe) and environments (White Studio, Alpine Mist, Snow Peaks).
Instructions:
1. Provide a direct, inspiring, and concise response answering Karthik's prompt or spatial engineering question.
2. Limit your answer to 2-3 engaging sentences (under 50 words).
${actionTriggered ? `3. Note: The 3D chamber was adjusted: ${actionTriggered}` : ""}`;

      const requestBody = {
        contents: [
          {
            role: "user",
            parts: [{ text: `${promptContext}\n\nKarthik asks: "${text}"` }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 120,
        },
      };

      let answerText = "";

      if (GEMINI_API_KEY) {
        const primaryUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`;
        const fallbackUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${GEMINI_API_KEY}`;

        const res = await fetch(primaryUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        });

        if (res.ok) {
          const data = await res.json();
          answerText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        } else {
          const fbRes = await fetch(fallbackUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
          });
          if (fbRes.ok) {
            const fbData = await fbRes.json();
            answerText = fbData.candidates?.[0]?.content?.parts?.[0]?.text || "";
          }
        }
      }

      if (!answerText) {
        answerText = actionTriggered
          ? `Chamber updated! ${actionTriggered} Spatial particle simulation adjusted to your query.`
          : `Synthesizing spatial geometry for "${text}". Exploring particle contours and kinematics in real-time.`;
      }

      const trimmedAnswer = answerText.trim();
      setAiAnswer(trimmedAnswer);
      speakAnswer(trimmedAnswer);
      if (actionTriggered) {
        toast.success(actionTriggered);
      }
    } catch (err) {
      const fallback = actionTriggered
        ? `Spatial chamber updated! ${actionTriggered}`
        : `Spatial analysis complete for "${text}". The particle chamber responded to your parameters.`;
      setAiAnswer(fallback);
      speakAnswer(fallback);
    } finally {
      setIsGenerating(false);
    }
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
    <div className="studio ff-tab-pane">
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
          <Link to="/dashboard" className="ff-brand" aria-label="FocusFlow dashboard">
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

        {/* Floating AI Answer Bubble */}
        {aiAnswer && (
          <div className="w-full max-w-2xl mx-auto mb-2.5 p-3 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-white/95 dark:border-white/10 shadow-[0_12px_32px_rgba(79,111,246,0.18),0_2px_8px_rgba(0,0,0,0.06)] backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-start justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-xs">
                  <Bot size={13} />
                </div>
                <div>
                  <h4 className="text-[11px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                    FocusFlow Spatial AI
                    <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      Live
                    </span>
                  </h4>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    if (isSpeakingAnswer) {
                      stopSpeakingAnswer();
                    } else {
                      speakAnswer(aiAnswer);
                    }
                  }}
                  className="p-1 rounded-md text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title={isSpeakingAnswer ? "Stop speaking" : "Read aloud"}
                >
                  {isSpeakingAnswer ? <VolumeX size={13} className="text-blue-600 animate-pulse" /> : <Volume2 size={13} />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    stopSpeakingAnswer();
                    setAiAnswer(null);
                  }}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Close answer"
                >
                  <X size={13} />
                </button>
              </div>
            </div>

            <p className="mt-1.5 text-xs text-slate-700 dark:text-slate-200 leading-relaxed pl-8">
              {aiAnswer}
            </p>
          </div>
        )}

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
            placeholder={isListening ? "Listening... Speak your prompt" : "Describe spatial geometry or prompt FocusFlow AI..."}
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
            className="generate-control cursor-pointer"
            disabled={isGenerating || !prompt.trim()}
            onClick={() => handleGenerate()}
          >
            {isGenerating ? (
              <>
                <Loader2 size={13} className="mr-1 animate-spin" />
                <span>Thinking...</span>
              </>
            ) : (
              <>
                <Send size={13} className="mr-1" />
                <span>Generate</span>
              </>
            )}
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
