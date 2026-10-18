import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import type { AuthUser } from '../types';
import Navbar from '../components/NavBar';
import Footer from '../components/Footer';

interface Props {
  user:     AuthUser | null;
  onLogout: () => void;
}

const EFFECTIVE_DATE = 'October 18, 2026';

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">{title}</h2>
      <div className="mt-3 space-y-3 text-base leading-relaxed text-gray-700">{children}</div>
    </section>
  );
}

function Ext({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-yimby-700 underline underline-offset-2 hover:text-yimby-800"
    >
      {children}
    </a>
  );
}

export default function PrivacyPage({ user, onLogout }: Props) {
  return (
    <div className="min-h-screen bg-white">
      <Navbar user={user} onLogout={onLogout} />

      <main className="max-w-3xl mx-auto px-5 sm:px-10 py-10 sm:py-16">
        <Link to="/" className="text-sm font-medium text-yimby-700 hover:text-yimby-800">
          ← Back to the tracker
        </Link>

        <h1 className="mt-6 text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-gray-500">Effective {EFFECTIVE_DATE}</p>

        <p className="mt-6 text-base leading-relaxed text-gray-700">
          YIMBY Tracker (yimby-tracker.fyi) is an independent project. You can browse the
          whole site without an account. This page explains what information is
          collected when you visit, why, and what choices you have.
        </p>

        <Section title="Advertising (Google AdSense)">
          <p>
            This site shows ads served by Google AdSense. Google and its partners use
            cookies and similar technologies to serve ads, including ads based on your
            previous visits to this and other websites, and to measure how ads perform.
          </p>
          <p>
            Visitors in the European Economic Area, the United Kingdom and Switzerland
            are asked for consent before personalized ads are shown, through a consent
            message provided by Google. You can change your choice at any time from the
            privacy settings link that message provides.
          </p>
          <p>
            You can turn off personalized ads from Google
            at <Ext href="https://adssettings.google.com">Google Ad Settings</Ext>, and
            opt out of many third-party advertisers
            at <Ext href="https://www.aboutads.info/choices/">aboutads.info</Ext>. Learn
            how Google uses information from sites that use its services
            at <Ext href="https://policies.google.com/technologies/partner-sites">policies.google.com</Ext>.
          </p>
        </Section>

        <Section title="Visitor statistics (GoatCounter)">
          <p>
            Page views are counted with GoatCounter, which runs on this site's own
            server at stats.yimby-tracker.fyi rather than a third-party service. It does
            not use cookies and does not store your IP address. It records the page
            visited, the referring site, your browser and operating system, screen size,
            and approximate location (country), and reports them only in aggregate.
          </p>
        </Section>

        <Section title="Contact form">
          <p>
            If you send a message through the form at the bottom of the page, the name,
            email address and message you enter, along with your IP address, are
            delivered to the site maintainer through Telegram. They are used only to
            read and reply to your message and to deal with abuse such as spam. They
            are not sold, shared for marketing, or added to any mailing list.
          </p>
        </Section>

        <Section title="Server logs">
          <p>
            Like most websites, the web server records each request, including your IP
            address, the page requested, your browser's user agent, and the time. These
            logs are used to keep the site running, measure performance and investigate
            errors or abuse. They are rotated automatically, with older entries deleted
            as new ones are written.
          </p>
        </Section>

        <Section title="Other services this site loads">
          <p>Some parts of the page are loaded from other providers, which receive your IP address when they send them:</p>
          <ul className="list-disc space-y-1 pl-6">
            <li><strong>Google Fonts</strong>: the site's typefaces.</li>
            <li><strong>OpenStreetMap</strong>: the map tiles on the Cities tab.</li>
            <li><strong>unpkg</strong>: the stylesheet for the map.</li>
          </ul>
          <p>
            The site is hosted on Amazon Web Services. Site administrators sign in
            through Amazon Cognito; ordinary visitors never need an account.
          </p>
        </Section>

        <Section title="Your choices and rights">
          <p>
            Depending on where you live, you may have the right to ask what personal
            information is held about you, to have it corrected or deleted, or to
            object to its use. To make a request about anything you sent through the
            contact form, or any other privacy question, use the contact form at the
            bottom of this page. For data collected by Google for advertising, use the
            Google links above.
          </p>
          <p>
            You can also block or delete cookies in your browser's settings. Doing so
            does not stop you from using this site.
          </p>
        </Section>

        <Section title="Changes to this policy">
          <p>
            If this policy changes, the updated version will be posted on this page
            with a new effective date.
          </p>
        </Section>
      </main>

      <Footer />
    </div>
  );
}
