import { ArrowUp, Sparkles, Send, ShieldCheck, Github, Twitter, Disc as Discord, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { gsapScrollTo } from "@/hooks/use-gsap-smooth-scroll";

export function FocusFlowFooter() {
  const scrollToTop = () => {
    gsapScrollTo(0, { duration: 1.2 });
  };

  return (
    <footer className="focusflow-footer" aria-label="Site footer">
      <div className="footer-glow" aria-hidden="true" />

      <div className="footer-container">
        {/* Top Newsletter & Manifesto Banner */}
        <div className="footer-cta-card">
          <div className="footer-cta-content">
            <span className="footer-badge">
              <Sparkles className="size-3.5 text-[#38bdf8]" />
              <span>STUDENT OS 2.0</span>
            </span>
            <h3 className="footer-cta-title">
              Ready to find your <span className="text-[#38bdf8]">flow</span> state?
            </h3>
            <p className="footer-cta-desc">
              Join 120,000+ students mastering their courses, deadlines, and personal growth with FocusFlow.
            </p>
          </div>

          <form
            className="footer-newsletter-form"
            onSubmit={(e) => {
              e.preventDefault();
              alert("Thanks for subscribing to FocusFlow updates!");
            }}
          >
            <div className="newsletter-input-wrap">
              <input
                type="email"
                placeholder="Enter your student email..."
                required
                className="newsletter-input"
              />
              <Button type="submit" className="newsletter-btn">
                <span>Get Started</span>
                <ArrowRight className="size-4" />
              </Button>
            </div>
            <span className="newsletter-note">Zero spam. Encrypted student privacy guarantee.</span>
          </form>
        </div>

        {/* Main Links Grid */}
        <div className="footer-grid">
          {/* Brand Column */}
          <div className="footer-brand-col">
            <div className="footer-brand-lockup">
              <span className="footer-brand-title">FocusFlow</span>
              <span className="footer-sparkle" aria-hidden="true">✦</span>
            </div>
            <p className="footer-brand-bio">
              The intelligent student operating system designed to turn chaotic study weeks into effortless, focused momentum.
            </p>
            <div className="footer-trust-badge">
              <ShieldCheck className="size-4 text-[#38bdf8]" />
              <span>SOC2 Type II & FERPA Compliant</span>
            </div>
          </div>

          {/* Column 1: Ecosystem */}
          <div className="footer-col">
            <h4 className="footer-col-title">PRODUCT</h4>
            <ul className="footer-links">
              <li><a href="#hero">Full Screen Studio</a></li>
              <li><a href="#showcase">Waveform Carousel</a></li>
              <li><a href="#features">Smart Planning</a></li>
              <li><a href="#features">Progress Tracking</a></li>
              <li><a href="#features">Task Management</a></li>
              <li><a href="#features">Study Resources</a></li>
            </ul>
          </div>

          {/* Column 2: Solutions */}
          <div className="footer-col">
            <h4 className="footer-col-title">FOR STUDENTS</h4>
            <ul className="footer-links">
              <li><a href="#hero">University OS</a></li>
              <li><a href="#hero">High School Focus</a></li>
              <li><a href="#hero">Medical & STEM Tracks</a></li>
              <li><a href="#hero">Campus Ambassador Club</a></li>
              <li><a href="#hero">Student Discounts (100% Free)</a></li>
              <li><a href="#hero">Peer Study Rooms</a></li>
            </ul>
          </div>

          {/* Column 3: Science & Resources */}
          <div className="footer-col">
            <h4 className="footer-col-title">METHODOLOGY</h4>
            <ul className="footer-links">
              <li><a href="#hero">The Science of Deep Work</a></li>
              <li><a href="#hero">Spaced Repetition Guides</a></li>
              <li><a href="#hero">ADHD-Friendly Planning</a></li>
              <li><a href="#hero">Active Recall Strategies</a></li>
              <li><a href="#hero">Student Stories & Logs</a></li>
              <li><a href="#hero">Community Discord</a></li>
            </ul>
          </div>

          {/* Column 4: Trust & Organization */}
          <div className="footer-col">
            <h4 className="footer-col-title">LEGAL & TRUST</h4>
            <ul className="footer-links">
              <li><a href="#hero">Privacy Manifesto</a></li>
              <li><a href="#hero">Terms of Service</a></li>
              <li><a href="#hero">Security Architecture</a></li>
              <li><a href="#hero">Student Data Protection</a></li>
              <li><a href="#hero">System Uptime (99.99%)</a></li>
              <li><a href="#hero">Cookie Preferences</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <div className="footer-status-pill">
            <span className="status-dot" aria-hidden="true" />
            <span>All Global FocusFlow Nodes Operational · v2.4.0</span>
          </div>

          <div className="footer-copyright">
            © {new Date().getFullYear()} FocusFlow Inc. Built for ambitious students worldwide.
          </div>

          <div className="footer-social-wrap">
            <button
              type="button"
              onClick={scrollToTop}
              className="footer-back-to-top"
              aria-label="Back to top"
            >
              <span>TOP</span>
              <ArrowUp className="size-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
