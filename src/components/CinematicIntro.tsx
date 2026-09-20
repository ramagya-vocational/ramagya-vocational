import { useEffect, useState } from "react";
import logo from "@/assets/ramagya-logo.png.asset.json";
import workshop from "@/assets/workshop-lab.jpg";

const WORDS = ["RAMAGYA", "VOCATIONAL", "EDUCATION"];
const SIGNALS = ["AGRI-TECH", "DESIGN", "ENGINEERING", "HUMAN SERVICES"];

export function CinematicIntro() {
  const [mounted, setMounted] = useState(false);
  const [done, setDone] = useState(true);

  useEffect(() => {
    setMounted(true);
    const play = () => {
      setDone(false);
      window.setTimeout(() => setDone(true), 8800);
    };
    const seen = sessionStorage.getItem("rv-intro-v2");
    let timer: number | undefined;
    if (!seen) {
      sessionStorage.setItem("rv-intro-v2", "1");
      setDone(false);
      timer = window.setTimeout(() => setDone(true), 8800);
    }
    window.addEventListener("rv-replay-intro", play);
    return () => {
      if (timer) window.clearTimeout(timer);
      window.removeEventListener("rv-replay-intro", play);
    };
  }, []);

  if (!mounted || done) return null;

  return (
    <div
      data-intro
      onClick={() => setDone(true)}
      className="cinematic-intro"
      onKeyDown={(event) => event.key === "Escape" && setDone(true)}
      role="button"
      tabIndex={0}
      aria-label="Cinematic Ramagya Vocational Education introduction. Press Escape or click to skip."
    >
      <img src={workshop} alt="" className="intro-workshop" />
      <div className="intro-shade" />
      <div className="intro-scan" />
      <div className="intro-grid" />
      <div className="intro-letterbox intro-letterbox-top" />
      <div className="intro-letterbox intro-letterbox-bottom" />

      <div className="intro-telemetry intro-telemetry-left">
        <span>RVE // SKILL LAB</span><span>SESSION 2026</span><span>CLASS IX</span>
      </div>
      <div className="intro-telemetry intro-telemetry-right">
        <span>LIVE SYSTEM</span><span>NOIDA · INDIA</span><span>12 MODULES</span>
      </div>

      <div className="intro-lock"><i /><i /><i /><i /><span>FUTURE IN FOCUS</span></div>

      <div className="intro-brand">
        <div className="intro-crest-wrap">
          <span className="intro-orbit intro-orbit-a" />
          <span className="intro-orbit intro-orbit-b" />
          <div className="intro-crest">
            <img src={logo.url} alt="Ramagya School crest" width={132} height={132} />
            <span className="intro-crest-sweep" />
          </div>
        </div>

        <p className="intro-kicker">THE NEXT GENERATION OF SKILL EDUCATION</p>
        <h1>
          {WORDS.map((w, i) => (
            <span key={w}>{w}</span>
          ))}
        </h1>
        <span className="intro-rule" />
        <div className="intro-signals">
          {SIGNALS.map((signal) => <span key={signal}>{signal}</span>)}
        </div>
        <p className="intro-motto">ARISE <b>·</b> AWAKE <b>·</b> ATTAIN</p>
      </div>

      <span className="intro-skip">CLICK ANYWHERE TO SKIP <i /></span>
    </div>
  );
}
