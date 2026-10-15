import { useEffect, useRef } from 'react';

export function Mascot() {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = host.current;
    if (!container) return;

    if (!document.querySelector('script[data-focusflow-spline]')) {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = 'https://cdn.spline.design/@splinetool/viewer@2.0.82/build/spline-viewer.js';
      script.dataset['focusflowSpline'] = 'true';
      document.head.appendChild(script);
    }

    const viewer = document.createElement('spline-viewer');
    viewer.setAttribute('url', 'https://prod.spline.design/age9ORggo4UWH3Yt/scene.splinecode');
    viewer.setAttribute('loading-anim-type', 'none');
    viewer.setAttribute('background', 'transparent');
    viewer.setAttribute('hint', 'false');
    viewer.setAttribute('aria-label', 'Interactive FocusFlow mascot');
    container.appendChild(viewer);

    const hideLogo = () => {
      const shadow = viewer.shadowRoot;
      if (shadow) {
        const logo = shadow.querySelector('#logo') as HTMLElement | null;
        if (logo) logo.style.display = 'none';
      }
    };
    viewer.addEventListener('load-complete', hideLogo);
    const logoInterval = setInterval(hideLogo, 200);
    const logoTimeout = setTimeout(() => clearInterval(logoInterval), 4000);

    return () => {
      clearInterval(logoInterval);
      clearTimeout(logoTimeout);
      viewer.remove();
    };
  }, []);

  return <div ref={host} className="spline-host" aria-label="Interactive 3D mascot" />;
}
