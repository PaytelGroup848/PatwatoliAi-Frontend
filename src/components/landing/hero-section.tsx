import { LandingNavbar } from "./landing-navbar";
import Image from "next/image";
import indianFlag from "@/app/indian-flag.png";

export function HeroSection() {
  return (
    <>
      <LandingNavbar />

      <main>
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="dot"></span> THE MULTI-MODEL AI PLATFORM
            </div>
            <h1>
              One platform.
              <br />
              Many minds.
              <br />
              <em>Limitless potential.</em>
            </h1>
            <p className="hidden min-[751px]:block">
              Your everyday questions. Your most specialized work.
              <br />
              Meet General, LawGPT, Code Architect, Med Assist
              <br className="desktop" />
              and more — together in Patwatoli AI.
            </p>

            <p className="block min-[751px]:hidden">
              Your everyday questions. Your most specialized work. questions
              Meet General, LawGPT, Code Architect, Med Assist and more —
              together in Patwatoli AI.
            </p>

            <div className="actions">
              <a className="button" href="/chat">
                Start exploring <span>↗</span>
              </a>
              <a className="textlink" href="#platform">
                <span className="play">▶</span> See what’s possible
              </a>
            </div>

            <div className="hero-note">
              <span>✳</span> Purpose-built intelligence. One connected
              experience.
            </div>
          </div>

          <div>
            <span className="made-in-india">
              Made In India
              <Image
                className="indian-flag"
                src={indianFlag}
                alt="Indian flag"
                width={64}
                height={64}
              />
            </span>

            <div className="hero-visual">
              <img
                className="hero-dashboard"
                src="/Patwatoli-Dashboard-Image-2 (1).png"
                alt="Patwatoli dashboard preview"
              />
            </div>
          </div>
        </section>

       <div className="capability-strip">
          <span>Intelligence for every direction</span>
          <b>✧ General</b>
          <b>⚖ LawGPT</b>
          <b>&lt;/&gt; Code Architect</b>
          <b>＋ Med Assist</b>
          <b>↗ And more</b>
        </div>
      </main>
    </>
  );
}
