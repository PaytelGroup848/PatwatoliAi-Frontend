import Image from 'next/image';
import Link from 'next/link';
export function LandingFooter() {
  return (
    <footer className="landing-footer">
      <div className="landing-footer-brand">
        <Link href="/" aria-label="Patwatoli home">
          <Image
            className="landing-footer-logo"
            src="/logo.png"
            alt="Patwatoli"
            width={180}
            height={60}
          />
        </Link>
        <p>
          Many models. One platform.
          <br />
          Intelligence for what comes next.
        </p>
        <div className="landing-footer-bottom">
          <span>© 2026 Patwatoli. All rights reserved.</span>
          <span>Built for a world of possibilities.</span>
        </div>
      </div>

      <nav className="landing-footer-links" aria-label="Footer">
        <div>
          <b>Explore</b>
          <Link href="/contact">Contact Us</Link>
          <Link href="/#possibilities">Use cases</Link>
          <Link href="/#pricing">Pricing</Link>
          <Link href="/chat">Open app</Link>
        </div>
        <div>
          <b>The details</b>
          <Link href="/privacy">Privacy policy</Link>
          <Link href="/terms">Terms and conditions</Link>
        </div>
      </nav>
    </footer>
  );
}
