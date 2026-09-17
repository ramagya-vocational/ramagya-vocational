import { useEffect, useState } from "react";
import logo from "@/assets/ramagya-logo.png.asset.json";

const WORDS = ["Ramagya", "Vocational", "Education"];

export function CinematicIntro() {
  const [mounted, setMounted] = useState(false);
  const [done, setDone] = useState(true);

  useEffect(() => {
    setMounted(true);
    const seen = sessionStorage.getItem("rv-intro");
    if (seen) return;
    sessionStorage.setItem("rv-intro", "1");
    setDone(false);
    const t = setTimeout(() => setDone(true), 4200);
    return () => clearTimeout(t);
  }, []);

  if (!mounted || done) return null;

  return (
    <div
      data-intro
      onClick={() => setDone(true)}
      className="fixed inset-0 z-[100] flex cursor-pointer items-center justify-center overflow-hidden bg-ink"
      style={{ animation: "intro-out 4.2s cubic-bezier(0.7,0,0.2,1) forwards" }}
    >
      {/* deep atmosphere */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 45%, oklch(0.42 0.14 55 / 0.65), transparent 62%), radial-gradient(ellipse at 20% 90%, oklch(0.5 0.18 30 / 0.35), transparent 60%)",
        }}
      />

      {/* horizon grid */}
      <div
        className="pointer-events-none absolute inset-x-[-40%] bottom-[-10%] h-[70%] origin-bottom"
        style={{
          backgroundImage:
            "linear-gradient(oklch(0.83 0.16 88 / 0.45) 1px, transparent 1px), linear-gradient(90deg, oklch(0.83 0.16 88 / 0.35) 1px, transparent 1px)",
          backgroundSize: "90px 90px",
          maskImage: "linear-gradient(to top, black, transparent 78%)",
          animation: "intro-grid 4.2s ease-out forwards",
        }}
      />

      {/* floating embers */}
      {Array.from({ length: 22 }).map((_, i) => (
        <span
          key={i}
          className="absolute h-1 w-1 rounded-full bg-gold"
          style={{
            left: `${(i * 37) % 100}%`,
            top: `${55 + ((i * 17) % 40)}%`,
            animation: `intro-drift ${2.6 + (i % 5) * 0.45}s ease-out ${(i % 7) * 0.22}s infinite`,
            boxShadow: "0 0 12px oklch(0.83 0.16 88 / 0.9)",
          }}
        />
      ))}

      <div className="relative flex flex-col items-center px-6 text-center">
        {/* crest with shockwave rings + light sweep */}
        <div className="relative">
          {[0, 1].map((r) => (
            <span
              key={r}
              className="absolute inset-0 rounded-full border border-gold/60"
              style={{ animation: `intro-ring 2.4s ease-out ${0.35 + r * 0.45}s forwards` }}
            />
          ))}
          <div
            className="relative overflow-hidden rounded-full p-4"
            style={{ animation: "intro-crest 2s cubic-bezier(0.16,1,0.3,1) forwards" }}
          >
            <img
              src={logo.url}
              alt="Ramagya School crest"
              width={132}
              height={132}
              className="h-[132px] w-[132px] object-contain drop-shadow-[0_0_40px_oklch(0.83_0.16_88/0.55)]"
            />
            <span
              className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2"
              style={{
                background:
                  "linear-gradient(90deg, transparent, oklch(1 0 0 / 0.75), transparent)",
                animation: "intro-sweep 1.5s ease-in-out 1.1s forwards",
              }}
            />
          </div>
        </div>

        <h1 className="mt-10 flex flex-wrap justify-center gap-x-4 text-5xl leading-none font-semibold tracking-tight text-background sm:text-7xl">
          {WORDS.map((w, i) => (
            <span
              key={w}
              className={i === 2 ? "text-gradient-sun" : ""}
              style={{
                display: "inline-block",
                opacity: 0,
                animation: `intro-word 1s cubic-bezier(0.16,1,0.3,1) ${1.3 + i * 0.18}s forwards`,
              }}
            >
              {w}
            </span>
          ))}
        </h1>

        <span
          className="gradient-sun mt-7 h-px w-48 origin-left"
          style={{ animation: "intro-rule 1.1s cubic-bezier(0.16,1,0.3,1) 2.1s forwards", opacity: 0 }}
        />

        <p
          className="mt-6 text-xs tracking-[0.42em] text-gold/90 uppercase"
          style={{ opacity: 0, animation: "intro-word 1s ease-out 2.35s forwards" }}
        >
          Arise · Awake · Attain
        </p>
      </div>

      <span className="absolute bottom-7 text-[11px] tracking-[0.3em] text-background/40 uppercase">
        Tap to skip
      </span>
    </div>
  );
}
