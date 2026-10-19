# FocusFlow — Official Student Platform & AI Copilot

> **Elevator Pitch:** Bring your studies, deadlines, and daily momentum together with an all-in-one AI study companion featuring real-time voice planning, interactive 3D spatial companions, and distraction-free focus sessions.

---

## 💡 Inspiration

University and student life today is deeply fragmented. As students, we juggle lecture schedules across calendar apps, task deadlines on sticky notes or spreadsheets, hackathon and competition deadlines on Discord or Notion, and study timer tools in separate browser tabs.

When cognitive overload sets in, conventional productivity tools feel sterile, intimidating, and mechanical. We wanted to build something fundamentally different: **FocusFlow** — a digital sanctuary that blends state-of-the-art spatial web aesthetics (liquid glass, dynamic waveforms, and responsive 3D companions) with an empathetic AI copilot that you can literally talk to. We wanted a study platform that doesn’t just record tasks, but actively reduces study anxiety and induces deep flow state.

---

## ⚡ What It Does

FocusFlow is a unified, intelligent operating system for students:

1. **AI Voice Assistant & "Plan Your Day" Copilot**: 
   - Powered by Gemini and conversational speech recognition (`SpeechRecognition` & `SpeechSynthesis`).
   - Students can speak naturally to organize tasks, prioritize assignments (e.g. *"I have a Computer Networks assignment due tonight and an internship deadline Friday, what should I do first?"*), and generate realistic study timelines.
2. **Interactive 3D Spline Mascot Companion**:
   - An organic, iridescent 3D mascot built with WebGL/Spline that reacts to touch, cursor drag, and audio voice frequency equalizer bars, serving as an emotional and visual anchor during intense study sprints.
3. **Smart Task & Day Management**:
   - Real-time priority sorting, due-date countdown tickers, and seamless completion streaks.
4. **Deep Focus Session Engine**:
   - Built-in Pomodoro/focus timer with animated frequency soundwaves and ambient aura states (Thinking, Listening, Speaking, Focusing).
5. **Academic Calendar & Opportunities Hub**:
   - Aggregated deadlines, university course sessions, hackathons, and research internships in curated glass capsules.
6. **Spatial Creation Studio**:
   - Interactive 3D spatial environment leveraging Three.js and custom particle shaders for immersive brainstorming.

---

## 🛠️ How We Built It

FocusFlow was engineered with a modern full-stack web architecture prioritizing 60fps micro-animations and zero-latency interactions:

- **Frontend Framework**: [TanStack Start](https://tanstack.com/start) & [TanStack Router](https://tanstack.com/router) with React 19 for type-safe server-side rendering and client routing.
- **3D & Spatial Graphics**: 
  - `@splinetool/viewer` for interactive WebGL 3D meshes and organic spline scenes.
  - `Three.js` (`@react-three/fiber` & `@react-three/drei`) for custom procedural spatial geometries.
- **Motion & Fluid Physics**: 
  - GSAP (GreenSock) with `ScrollTrigger` and `ScrollToPlugin` paired with `Lenis` smooth scroll for buttery 60fps editorial transitions.
  - SVG Cubic Bézier dynamic contour equations for responsive wave banners.
- **AI & Voice Engine**:
  - Google Gemini API (`gemini-2.5-flash`) for contextual study planning and task prioritization.
  - Native browser Web Speech API for bidirectional voice conversations.
- **Styling & Design System**:
  - Custom Tailwind CSS with a curated **White Liquid Glass** design token system:
    $$\text{Backdrop Blur} = 28\text{px}, \quad \text{Saturation} = 180\%, \quad \text{Border} = \text{rgba}(255, 255, 255, 0.95)$$
  - Typographic pairing of *Michroma* (futuristic geometric display), *Manrope*, and *IBM Plex Mono*.

### Mathematical & Physics Foundations

#### 1. Dynamic Waveform Curvature & Inertia Decay
The smooth waveform transitions and carousel physics are calculated using momentum damping:

$$v_{t+1} = v_t \cdot (1 - \mu) + a \cdot \Delta t$$

where $\mu \approx 0.08$ is the friction coefficient. The cubic Bézier control points dynamically shift according to normalized drag displacement $\delta \in [-1, 1]$:

$$P_{\text{control}}(y) = P_{\text{rest}} + A \cdot \sin\left(\frac{2\pi y}{\lambda} + \phi\right) \cdot (1 - e^{-k|\delta|})$$

#### 2. Soundwave Equalizer Frequency Harmonics
During voice generation, each equalizer bar height $h_i(t)$ fluctuates based on overlapping harmonic frequencies:

$$h_i(t) = h_{\text{base}} + \sum_{n=1}^{3} \frac{\alpha_n}{n} \sin\left(2\pi f_n t + \theta_i\right)$$

---

## 🚧 Challenges We Faced

1. **Hydration & WebGL in SSR**:
   - Server-side rendering a 3D WebGL `<spline-viewer>` inside TanStack Start caused window/document reference issues and canvas context collisions. We engineered an asynchronous element definition wrapper using `customElements.whenDefined('spline-viewer')` to guarantee zero SSR hydration crashes.
2. **Audio & Speech Synthesis Synchronization**:
   - Browsers implement strict autoplay and user-interaction constraints on the Web Speech API. We designed an interaction-gated audio state machine that coordinates microphone recording (`SpeechRecognition`), AI token streaming, and voice playback (`SpeechSynthesisUtterance`) with visual soundwave aura animations.
3. **High-Performance Glassmorphism without GPU Jitter**:
   - Stacking multiple `backdrop-filter: blur(28px)` layers across the 3D canvas caused frame drops on low-power devices. We optimized GPU compositing using `transform: translate3d(0, 0, 0)` and `will-change: transform`, preserving fluid 60fps across mobile and desktop.

---

## 🏆 Accomplishments That We're Proud Of

- **Living 3D Mascot Integration**: Seamlessly embedding an interactive 3D Spline companion inside both the main task dashboard and a floating modal voice assistant.
- **Zero-Latency Voice Study Planning**: Creating a conversational assistant that gives actionable, realistic advice tailored to a student's actual pending coursework.
- **Aesthetic Excellence**: Crafting an interface that feels like a next-generation Apple or futuristic OS product rather than a generic to-do app.

---

## 📚 What We Learned

- How to synchronize browser custom element lifecycles (`ShadowRoot` mutation observers) with React 19 component lifecycles.
- Managing low-latency voice UX and error fallbacks for conversational study planning.
- The power of spatial aesthetics and micro-interactions in transforming mundane academic scheduling into an engaging, calming habit.

---

## 🚀 What's Next for FocusFlow

- **Collaborative Study Spaces**: Shared spatial rooms where classmates can sync focus timers and co-study with shared 3D mascots.
- **LMS Canvas / Google Classroom Integration**: Direct automated two-way syncing of university course syllabi and submission deadlines.
- **Personalized AI Memory**: Long-term memory for the assistant to track your study habits, energy peaks, and exam countdowns over an entire academic semester.
