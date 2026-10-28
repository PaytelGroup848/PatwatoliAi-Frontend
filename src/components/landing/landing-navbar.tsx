'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';

const navigationLinks = [
  { label: 'AI models', href: '/#platform' },
  { label: 'Use cases', href: '/#possibilities' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'How it works', href: '/#how' },
  { label: 'FAQs', href: '/#faq' },
];

export function LandingNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="landing-header">
      <Link className="landing-header-home" href="/" aria-label="Patwatoli AI home">
        <Image
          className="landing-header-logo"
          src="/logo.png"
          alt="Patwatoli"
          width={300}
          height={80}
          priority
        />
      </Link>

      <nav
        id="landing-navigation"
        className={`landing-header-nav${menuOpen ? ' open' : ''}`}
        onClick={() => setMenuOpen(false)}
      >
        {navigationLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="landing-header-account">
        <Link className="landing-header-login" href="/chat?auth=login">
          Log in
        </Link>
        <Link className="landing-header-button" style={{ color: 'white' }} href="/chat">
          Try Patwatoli <ArrowUpRight aria-hidden="true" className="landing-header-button-icon" />
        </Link>
      </div>

      <button
        className="landing-header-menu"
        type="button"
        aria-label="Toggle navigation"
        aria-controls="landing-navigation"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((isOpen) => !isOpen)}
      >
        ☰
      </button>
    </header>
  );
}
