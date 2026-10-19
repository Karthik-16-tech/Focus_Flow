import { useEffect, useRef } from 'react';

interface MascotProps {
  className?: string;
  style?: React.CSSProperties;
}

export function Mascot({ className = '', style }: MascotProps = {}) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = host.current;
    if (!container) return;

    let cancelled = false;
    let viewer: HTMLElement | null = null;
    let logoInterval: ReturnType<typeof setInterval> | null = null;
    let logoTimeout: ReturnType<typeof setTimeout> | null = null;

    if (!document.querySelector('script[data-focusflow-spline]')) {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = 'https://cdn.spline.design/@splinetool/viewer@2.0.82/build/spline-viewer.js';
      script.dataset['focusflowSpline'] = 'true';
      document.head.appendChild(script);
    }

    const attachViewer = () => {
      if (cancelled || !container) return;
      container.innerHTML = '';

      viewer = document.createElement('spline-viewer');
      viewer.setAttribute('url', 'https://prod.spline.design/age9ORggo4UWH3Yt/scene.splinecode');
      viewer.setAttribute('loading-anim-type', 'none');
      viewer.setAttribute('background', 'transparent');
      viewer.setAttribute('hint', 'false');
      viewer.setAttribute('aria-label', 'Interactive FocusFlow mascot');
      viewer.style.width = '100%';
      viewer.style.height = '100%';
      viewer.style.display = 'block';

      const hideLogo = () => {
        if (!viewer) return;
        const shadow = viewer.shadowRoot;
        if (shadow) {
          if (!shadow.querySelector('#ff-hide-watermark')) {
            const styleEl = document.createElement('style');
            styleEl.id = 'ff-hide-watermark';
            styleEl.textContent = `
              #logo, #spline-logo, #spline-watermark, #spline-badge,
              a[href*="spline"], [aria-label*="Spline" i], [title*="Spline" i] {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                pointer-events: none !important;
              }
            `;
            shadow.appendChild(styleEl);
          }
          const logo = shadow.querySelector('#logo') as HTMLElement | null;
          if (logo) logo.style.display = 'none';
        }
      };

      viewer.addEventListener('load-complete', hideLogo);
      container.appendChild(viewer);

      logoInterval = setInterval(hideLogo, 200);
      logoTimeout = setTimeout(() => {
        if (logoInterval) clearInterval(logoInterval);
      }, 4000);
    };

    if (customElements.get('spline-viewer')) {
      attachViewer();
    } else {
      customElements.whenDefined('spline-viewer').then(() => {
        attachViewer();
      });
    }

    return () => {
      cancelled = true;
      if (logoInterval) clearInterval(logoInterval);
      if (logoTimeout) clearTimeout(logoTimeout);
      if (viewer) {
        viewer.remove();
        viewer = null;
      }
      if (container) {
        container.innerHTML = '';
      }
    };
  }, []);

  return (
    <div
      ref={host}
      className={`spline-host ${className}`.trim()}
      style={style}
      aria-label="Interactive 3D mascot"
    />
  );
}

