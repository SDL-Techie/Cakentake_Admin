

import { useState, useEffect } from "react";
import "./Terms.css";

interface Section {
  id: string;
  title: string;
  content: React.ReactNode;
}

const sections: Section[] = [
  {
    id: "acceptance",
    title: "1. Acceptance of Terms",
    content: (
      <>
        <p>
          By accessing or using our services, you confirm that you are at least 18 years of age
          and have read, understood, and agree to be bound by these Terms and Conditions. If you
          do not agree to these terms, please discontinue use of our platform immediately.
        </p>
        <p>
          These Terms constitute a legally binding agreement between you ("User") and our company
          ("We", "Us", "Our"). Your continued use of the platform following any updates to these
          Terms will constitute your acceptance of the revised terms.
        </p>
      </>
    ),
  },
  {
    id: "services",
    title: "2. Use of Services",
    content: (
      <>
        <p>
          Our platform provides digital services intended solely for lawful purposes. You agree
          not to misuse, reverse-engineer, copy, distribute, or exploit any portion of our
          service in any manner inconsistent with these Terms.
        </p>
        <ul>
          <li>You may not impersonate any person or entity.</li>
          <li>You may not attempt to gain unauthorized access to our systems.</li>
          <li>You may not transmit harmful, offensive, or unlawful content.</li>
          <li>You may not use automated bots or scrapers without prior written consent.</li>
        </ul>
        <p>
          We reserve the right to suspend or terminate access to users who violate these
          restrictions without notice or liability.
        </p>
      </>
    ),
  },
  {
    id: "privacy",
    title: "3. Privacy & Data",
    content: (
      <>
        <p>
          We are committed to protecting your personal data. Our Privacy Policy, incorporated
          herein by reference, outlines how we collect, store, and use your information. By
          using our services, you consent to such processing.
        </p>
        <p>
          We implement industry-standard security measures but cannot guarantee absolute security.
          You are responsible for maintaining the confidentiality of your account credentials.
        </p>
      </>
    ),
  },
  {
    id: "intellectual",
    title: "4. Intellectual Property",
    content: (
      <>
        <p>
          All content on this platform — including but not limited to logos, text, graphics,
          software, and design — is the exclusive intellectual property of our company and is
          protected under applicable copyright and trademark laws.
        </p>
        <p>
          You are granted a limited, non-exclusive, non-transferable license to access and use
          the platform for personal, non-commercial purposes. No rights are transferred to you
          beyond what is expressly stated in these Terms.
        </p>
      </>
    ),
  },
  {
    id: "liability",
    title: "5. Limitation of Liability",
    content: (
      <>
        <p>
          To the fullest extent permitted by law, we shall not be liable for any indirect,
          incidental, special, consequential, or punitive damages arising from your use of or
          inability to use the service, including loss of data, revenue, or profits.
        </p>
        <p>
          Our total cumulative liability to you for any claims arising from these Terms shall not
          exceed the amount you paid us, if any, in the twelve (12) months preceding the claim.
        </p>
      </>
    ),
  },
  {
    id: "termination",
    title: "6. Termination",
    content: (
      <>
        <p>
          We may suspend or terminate your account and access to our services at our sole
          discretion, with or without cause, and with or without notice. Upon termination, your
          right to use the service ceases immediately.
        </p>
        <p>
          Provisions of these Terms that by their nature should survive termination — including
          but not limited to intellectual property, limitation of liability, and governing law —
          shall continue to apply.
        </p>
      </>
    ),
  },
  {
    id: "governing",
    title: "7. Governing Law",
    content: (
      <>
        <p>
          These Terms shall be governed by and construed in accordance with the laws of the
          jurisdiction in which our company is registered, without regard to its conflict of
          law principles.
        </p>
        <p>
          Any disputes arising under these Terms shall be subject to the exclusive jurisdiction
          of the competent courts in that jurisdiction, and you hereby consent to such
          jurisdiction and venue.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    title: "8. Changes to Terms",
    content: (
      <>
        <p>
          We reserve the right to modify these Terms at any time. When we make material changes,
          we will notify you via email or a prominent notice on our platform at least 14 days
          before the changes take effect.
        </p>
        <p>
          It is your responsibility to review these Terms periodically. Your continued use of
          the service after any changes constitutes your acceptance of the new Terms.
        </p>
      </>
    ),
  },
  {
    id: "contact",
    title: "9. Contact Us",
    content: (
      <>
        <p>
          If you have any questions, concerns, or requests regarding these Terms and Conditions,
          please reach out to our legal team:
        </p>
        <div className="contact-block">
          <div className="contact-item">
            <span className="contact-label">Email</span>
            <span className="contact-value">legal@ourcompany.com</span>
          </div>
          <div className="contact-item">
            <span className="contact-label">Address</span>
            <span className="contact-value">123 Business Ave, Suite 400, City, Country</span>
          </div>
          <div className="contact-item">
            <span className="contact-label">Phone</span>
            <span className="contact-value">+1 (800) 000-0000</span>
          </div>
        </div>
      </>
    ),
  },
];

export default function Terms() {
  const [activeSection, setActiveSection] = useState<string>("acceptance");
  const [agreed, setAgreed] = useState(false);
  const [tocOpen, setTocOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 120;
      for (const section of sections) {
        const el = document.getElementById(section.id);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(section.id);
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setTocOpen(false);
    }
  };

  return (
    <div className="tnc-root">
      {/* Hero */}
      <header className="tnc-hero">
        <div className="hero-badge">Legal</div>
        <h1 className="hero-title">Terms &amp; Conditions</h1>
        <p className="hero-subtitle">
          Please read these terms carefully before using our platform.
        </p>
        <div className="hero-meta">
          <span>Effective Date: June 28, 2026</span>
          <span className="hero-divider">·</span>
          <span>Version 3.1</span>
        </div>
      </header>

      <div className="tnc-layout">
        {/* Sidebar TOC */}
        <aside className="tnc-sidebar">
          <div className="toc-card">
            <p className="toc-heading">Contents</p>
            <nav className="toc-nav">
              {sections.map((s) => (
                <button
                  key={s.id}
                  className={`toc-item ${activeSection === s.id ? "toc-item--active" : ""}`}
                  onClick={() => scrollTo(s.id)}
                >
                  {s.title}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Mobile TOC toggle */}
        <button className="toc-toggle" onClick={() => setTocOpen(!tocOpen)}>
          {tocOpen ? "✕ Close" : "☰ Table of Contents"}
        </button>
        {tocOpen && (
          <div className="toc-mobile-drawer">
            {sections.map((s) => (
              <button key={s.id} className="toc-mobile-item" onClick={() => scrollTo(s.id)}>
                {s.title}
              </button>
            ))}
          </div>
        )}

        {/* Main content */}
        <main className="tnc-main">
          {sections.map((s) => (
            <section key={s.id} id={s.id} className="tnc-section">
              <h2 className="section-title">{s.title}</h2>
              <div className="section-body">{s.content}</div>
            </section>
          ))}

          {/* Agreement footer */}
          <div className="tnc-agreement">
            <label className="agreement-label">
              <input
                type="checkbox"
                className="agreement-checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
              <span>
                I have read and agree to the Terms &amp; Conditions outlined above.
              </span>
            </label>
            <button className={`agreement-btn ${agreed ? "agreement-btn--active" : ""}`} disabled={!agreed}>
              Accept &amp; Continue
            </button>
          </div>
        </main>
      </div>

      <footer className="tnc-footer">
        <p>© 2026 Our Company. All rights reserved.</p>
        <p>Last updated: June 28, 2026</p>
      </footer>
    </div>
  );
}