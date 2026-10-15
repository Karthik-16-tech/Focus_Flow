import { useEffect, useRef, useState } from "react";

const sceneUrl = "https://prod.spline.design/W3mnjb83qnaKmTO1/scene.splinecode";
const scriptUrl = "https://cdn.spline.design/@splinetool/viewer@2.0.80/build/spline-viewer.js";

interface SplineSceneProps {
  isWorkspace?: boolean;
}

export function SplineScene({ isWorkspace = false }: SplineSceneProps) {
  const host = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState("loading");
  const viewerRef = useRef<HTMLElement | null>(null);

  // Handle workspace switching & tab visibility to pause 3D loop and save CPU
  useEffect(() => {
    const viewer = viewerRef.current as any;
    if (!viewer) return;

    const spline = viewer._spline || viewer.spline;
    const shouldPause = isWorkspace || document.hidden;

    if (shouldPause) {
      spline?.stop?.();
    } else {
      spline?.play?.();
    }

    const onVisibilityChange = () => {
      const isPaused = isWorkspace || document.hidden;
      if (isPaused) {
        spline?.stop?.();
      } else {
        spline?.play?.();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [isWorkspace, status]);

  useEffect(() => {
    const container = host.current;
    if (!container) return;
    let cancelled = false;
    let viewer: HTMLElement | undefined;
    let observer: MutationObserver | undefined;

    const suppressPhysicsError = (event: ErrorEvent) => {
      if (event.message?.includes("getPhysicsLocalMatrix")) {
        event.stopImmediatePropagation();
        event.preventDefault();
      }
    };
    window.addEventListener("error", suppressPhysicsError);

    const hideWatermark = () => {
      try {
        if (!viewer) return;
        const shadow = viewer.shadowRoot;
        if (shadow) {
          if (!shadow.querySelector("style[data-hide-watermark]")) {
            const style = document.createElement("style");
            style.setAttribute("data-hide-watermark", "true");
            style.textContent = `
              #logo,
              #spline-logo,
              #spline-watermark,
              #spline-badge,
              a[href*="spline"],
              a[href*="spline.design"],
              .spline-watermark,
              [aria-label*="Spline" i],
              [title*="Spline" i],
              [class*="watermark" i],
              [id*="watermark" i],
              [class*="logo" i],
              [id*="logo" i],
              [class*="badge" i],
              [id*="badge" i] {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                pointer-events: none !important;
                width: 0 !important;
                height: 0 !important;
                position: absolute !important;
                clip: rect(0, 0, 0, 0) !important;
                clip-path: inset(100%) !important;
                transform: scale(0) !important;
                z-index: -9999 !important;
              }
            `;
            shadow.appendChild(style);
          }

          const targets = shadow.querySelectorAll(
            '#logo, #spline-logo, #spline-watermark, #spline-badge, a[href*="spline"], a[href*="spline.design"], .spline-watermark, [aria-label*="Spline" i], [title*="Spline" i], [class*="watermark" i], [id*="watermark" i], [class*="logo" i], [id*="logo" i], [class*="badge" i], [id*="badge" i]'
          );
          targets.forEach((el) => {
            el.remove();
          });
        }

        viewer.querySelectorAll('a[href*="spline"], #logo, .spline-watermark, [class*="watermark"], [class*="badge"]').forEach((el) => {
          el.remove();
        });
      } catch {
        // ignore shadowDOM access constraints
      }
    };

    const loaded = () => {
      hideWatermark();
      setStatus("ready");

      // Fix glitching messages: keep primary clean state and prevent z-fighting
      try {
        const spline = (viewer as any)?._spline || (viewer as any)?.spline;
        const scene = spline?._scene || spline?.scene;
        if (scene) {
          scene.traverse((obj: any) => {
            const name = (obj.name || "").toLowerCase();
            // Hide secondary glitching message layer so it never collides with "Hi!"
            if (
              name.includes("human") ||
              name.includes("favorite")
            ) {
              obj.visible = false;
            }
            // Ensure any message or card layers have proper depth write
            if (name.includes("bubble") || name.includes("card") || name.includes("hi")) {
              if (obj.material) {
                obj.material.depthWrite = true;
                obj.material.needsUpdate = true;
              }
            }
          });
        }
      } catch (err) {
        console.warn("Spline depth fix error:", err);
      }

      window.setTimeout(() => {
        observer?.disconnect();
      }, 2000);
    };

    const failed = () => setStatus("error");

    const initialize = async () => {
      try {
        if (!document.querySelector('script[data-focusflow-spline]')) {
          const script = document.createElement("script");
          script.type = "module";
          script.src = scriptUrl;
          script.dataset["focusflowSpline"] = "true";
          script.addEventListener("error", failed);
          document.head.appendChild(script);
        }
        await customElements.whenDefined("spline-viewer");
        if (cancelled || !container) return;

        viewer = document.createElement("spline-viewer");
        viewerRef.current = viewer;
        viewer.setAttribute("loading", "eager");
        viewer.setAttribute("url", sceneUrl);
        viewer.setAttribute("aria-label", "FocusFlow interactive 3D scene");
        viewer.style.pointerEvents = "auto";
        viewer.addEventListener("load-complete", loaded);
        viewer.addEventListener("error", failed);
        viewer.addEventListener("splineerror", failed);
        container.appendChild(viewer);

        // One-time watermark cleanup & childList observer during load only
        hideWatermark();
        if (viewer.shadowRoot) {
          observer = new MutationObserver(() => hideWatermark());
          observer.observe(viewer.shadowRoot, { childList: true });
        }
      } catch {
        failed();
      }
    };

    void initialize();
    const timeout = window.setTimeout(() => setStatus((s) => (s === "ready" ? s : "slow")), 20000);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      window.removeEventListener("error", suppressPhysicsError);
      observer?.disconnect();
      viewer?.removeEventListener("load-complete", loaded);
      viewer?.removeEventListener("error", failed);
      viewer?.removeEventListener("splineerror", failed);
      viewer?.remove();
      viewerRef.current = null;
    };
  }, []);

  return (
    <div
      className="ff-scene"
      data-scene-status={status}
      data-is-workspace={isWorkspace ? "true" : undefined}
    >
      <div ref={host} className="ff-scene-host" />
      {status !== "ready" && !isWorkspace && (
        <div className="ff-scene-status" role="status">
          {status === "loading"
            ? "A little space to focus…"
            : "Your space is ready. The 3D scene is unavailable."}
        </div>
      )}
    </div>
  );
}
