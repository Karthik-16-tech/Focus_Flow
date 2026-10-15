import { useEffect, type RefObject } from "react";

export interface VideoScrubOptions {
  lerpFactor?: number; // Smoothness factor (default: 0.3)
  reverseDirection?: boolean; // true if moving right-to-left advances video (default: true)
  useBlobPrebuffer?: boolean; // Pre-cache video into RAM Blob (default: true)
  src?: string; // Optional direct video URL
  autoplayOnIdle?: boolean; // (default: false - video never autoplays)
  idleResumeDelayMs?: number;
}

export function getScrubTime(
  clientX: number,
  left: number,
  width: number,
  duration: number,
  reverse = true,
) {
  if (width <= 0 || duration <= 0) return 0;
  const normalizedX = Math.min(1, Math.max(0, (clientX - left) / width));
  return (reverse ? 1 - normalizedX : normalizedX) * duration;
}

export function useVideoScrub(
  heroRef: RefObject<HTMLElement | null>,
  videoRef: RefObject<HTMLVideoElement | null>,
  options: VideoScrubOptions = {},
) {
  const {
    lerpFactor = 0.32,
    reverseDirection = true,
    useBlobPrebuffer = true,
    src: customSrc,
    autoplayOnIdle = false,
  } = options;

  useEffect(() => {
    const hero = heroRef.current;
    const video = videoRef.current;
    if (!video || !hero) return;

    let isCancelled = false;
    let blobUrl: string | null = null;
    let isInteracting = false;
    let targetProgress = 0;
    let currentProgress = 0;
    let settled = true;
    let pendingSeek: number | null = null;
    let rafId: number | null = null;

    video.preload = "auto";
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.loop = false;
    video.autoplay = false;
    try {
      video.pause();
    } catch {}

    // Ensure video starts at 0 (first frame) paused
    const onLoadedMetadata = () => {
      if (!isInteracting) {
        video.currentTime = 0;
        try {
          video.pause();
        } catch {}
      }
    };
    video.addEventListener("loadedmetadata", onLoadedMetadata);

    // 1. Resolve effective video source
    const getEffectiveSrc = () => {
      if (customSrc) return customSrc;
      if (video.currentSrc) return video.currentSrc;
      if (video.src) return video.src;
      const sourceEl = video.querySelector("source");
      if (sourceEl?.src) return sourceEl.src;
      return "/focusflow-scrub.mp4";
    };

    // 2. Pre-buffer video into RAM Blob to eliminate network seeking latency
    if (useBlobPrebuffer) {
      const prebuffer = async () => {
        try {
          const rawSrc = getEffectiveSrc();
          if (!rawSrc) return;
          const res = await fetch(rawSrc);
          if (!res.ok) return;
          const blob = await res.blob();
          if (isCancelled || !video) return;
          blobUrl = URL.createObjectURL(blob);
          const prevTime = video.currentTime;
          video.src = blobUrl;
          video.currentTime = prevTime;
          video.pause();
        } catch {
          // Gracefully falls back to existing streaming src
        }
      };
      prebuffer();
    }

    // 3. Fast seek execution
    const performSeek = (sec: number) => {
      if (!video) return;
      try {
        if ("fastSeek" in video && typeof (video as any).fastSeek === "function") {
          (video as any).fastSeek(sec);
        } else {
          video.currentTime = sec;
        }
        if (!video.paused) {
          video.pause();
        }
      } catch {}
    };

    const onSeeked = () => {
      if (pendingSeek !== null) {
        const next = pendingSeek;
        pendingSeek = null;
        performSeek(next);
      } else if (isInteracting && !settled) {
        startLoop();
      }
    };
    video.addEventListener("seeked", onSeeked);

    // 4. Smooth rAF physics interpolation loop
    const DEAD_ZONE = 0.0003;
    const step = () => {
      if (settled) return;

      const diff = targetProgress - currentProgress;
      if (Math.abs(diff) < DEAD_ZONE) {
        currentProgress = targetProgress;
        settled = true;
      } else {
        currentProgress += diff * lerpFactor;
      }

      const duration = video.duration;
      if (Number.isFinite(duration) && duration > 0) {
        const sec = Math.max(0, Math.min(duration - 0.04, currentProgress * duration));
        if (Math.abs(video.currentTime - sec) > 0.02) {
          if (video.seeking) {
            pendingSeek = sec;
          } else {
            performSeek(sec);
          }
        }
      }
    };

    const startLoop = () => {
      if (rafId !== null) return;
      const loop = () => {
        step();
        if (!settled && !isCancelled) {
          rafId = requestAnimationFrame(loop);
        } else {
          rafId = null;
        }
      };
      rafId = requestAnimationFrame(loop);
    };

    // 5. Cursor tracking across hero
    const handlePointerMove = (e: MouseEvent | PointerEvent) => {
      if ((e as PointerEvent).pointerType === "touch" || document.hidden) return;

      const rect = hero.getBoundingClientRect();
      const inside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;

      if (inside) {
        if (!isInteracting) {
          isInteracting = true;
          try {
            video.pause();
          } catch {}
          const d = video.duration;
          if (Number.isFinite(d) && d > 0) {
            currentProgress = Math.max(0, Math.min(1, video.currentTime / d));
          }
        }

        const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        targetProgress = reverseDirection ? 1 - ratio : ratio;
        if (settled) {
          settled = false;
          startLoop();
        }
      }
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("mousemove", handlePointerMove, { passive: true });

    return () => {
      isCancelled = true;
      if (rafId !== null) cancelAnimationFrame(rafId);
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("seeked", onSeeked);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("mousemove", handlePointerMove);
    };
  }, [
    heroRef,
    videoRef,
    lerpFactor,
    reverseDirection,
    useBlobPrebuffer,
    customSrc,
    autoplayOnIdle,
  ]);
}