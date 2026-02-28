import { QrCode, Zap, Palette, Download, Shield, Globe } from 'lucide-react';
import Link from 'next/link';

const FEATURES = [
  {
    icon: QrCode,
    title: '9 QR Code Types',
    desc: 'UPI payments, websites, WiFi, contacts, social media, email, phone, SMS, and custom text.',
  },
  {
    icon: Palette,
    title: 'Full Customisation',
    desc: 'Dot styles, eye shapes, gradients, logos, frames, watermarks, titles and captions.',
  },
  {
    icon: Zap,
    title: 'Instant Live Preview',
    desc: 'Every change you make is reflected in the QR code in real time — no waiting, no reloading.',
  },
  {
    icon: Download,
    title: 'Multi-Format Export',
    desc: 'Download as PNG, SVG, JPEG, or WebP at up to 4× resolution — completely free.',
  },
  {
    icon: Shield,
    title: 'No Sign-Up Required',
    desc: 'Generate and download QR codes without creating an account or sharing your email.',
  },
  {
    icon: Globe,
    title: 'Works in Your Browser',
    desc: 'Everything runs client-side. Your data never leaves your device.',
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-14">
      {/* Hero */}
      <div className="text-center mb-16">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-[var(--color-text)] mb-5 tracking-tight">
          About QR Code Studio
        </h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto">
          QR Code Studio is a free, open, browser-based QR code generator built for students,
          small businesses, freelancers, and anyone who needs a beautiful QR code — instantly.
        </p>
      </div>

      {/* Story */}
      <div className="p-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] shadow-sm mb-12">
        <h2 className="text-2xl font-extrabold text-[var(--color-text)] mb-4">
          Why I Built This
        </h2>
        <div className="space-y-4 text-gray-500 dark:text-gray-400 leading-relaxed">
          <p>
            Most QR code generators are cluttered with ads, hide useful features behind paywalls, or require
            you to create an account just to download a file. I built QR Code Studio to fix that.
          </p>
          <p>
            The goal was simple: a clean, fast, powerful QR code tool that respects your time and doesn&apos;t
            get in your way. No ads. No watermarks. No accounts. Just a great tool.
          </p>
          <p>
            It started as a personal side project and grew into something I&apos;m genuinely proud of. If it
            saves you time or helps your business, that&apos;s all I could ask for.
          </p>
        </div>
        <div className="mt-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-xl font-extrabold text-orange-600 dark:text-yellow-400">
            D
          </div>
          <div>
            <p className="font-bold text-[var(--color-text)]">Dario George</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Full Stack Developer</p>
            <div className="flex gap-3 mt-2">
              <a href="https://github.com/dariogeorge21" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-[var(--color-text)] transition-colors">
                GitHub
              </a>
              <a href="https://linkedin.com/in/dariogeorge21" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-[var(--color-text)] transition-colors">
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="mb-12">
        <h2 className="text-2xl font-extrabold text-[var(--color-text)] mb-8 text-center">
          What You Get
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] shadow-sm hover:shadow-md transition-shadow"
            >
              <f.icon className="w-8 h-8 text-orange-600 dark:text-yellow-400 mb-3" />
              <h3 className="font-bold text-[var(--color-text)] mb-1">{f.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center p-10 rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] shadow-sm">
        <h2 className="text-2xl font-extrabold text-[var(--color-text)] mb-3">Ready to create?</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          It&apos;s free, instant, and requires no account.
        </p>
        <Link
          href="/create"
          className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-white bg-orange-600 dark:bg-yellow-400 dark:text-black hover:opacity-90 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]"
        >
          <QrCode className="w-5 h-5" />
          Create a QR Code
        </Link>
      </div>
    </div>
  );
}
