import { FormEvent, useState } from 'react';
import { ArrowUpRight, Check, Copy } from 'lucide-react';

const SCOPE_OPTIONS = [
  'Brand Identity',
  'Web Platform',
  'Design System',
  'Creative Code',
];

export function ContactSection() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedScopes, setSelectedScopes] = useState<string[]>(['Brand Identity', 'Web Platform']);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [emailCopied, setEmailCopied] = useState(false);

  const toggleScope = (scope: string) => {
    setSelectedScopes((prev) =>
      prev.includes(scope) ? prev.filter((item) => item !== scope) : [...prev, scope]
    );
  };

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText('aa2993816@gmail.com');
      setEmailCopied(true);
      window.setTimeout(() => setEmailCopied(false), 1800);
    } catch {
      setEmailCopied(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setErrorMsg('Please enter your name, email address, and a brief note about the project.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    setErrorMsg('');
    setSubmitted(true);
  };

  return (
    <section id="contact" className="py-20 md:py-24 border-t border-[#3F2D63]/70">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <p className="text-xs font-medium tracking-wide text-[#E5C158] mb-2">
                Commission &amp; Collaboration
              </p>
              <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-[#F7F3EA] text-balance">
                Let’s build something clear and enduring.
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-[#DCD2EE] tracking-[0.01em]">
                I partner with founders, cultural institutions, and engineering teams on visual identities, design systems, and bespoke web applications. Booking Q1–Q2 commissions.
              </p>
            </div>

            <div className="pt-4 border-t border-[#3F2D63]/70 space-y-3">
              <p className="text-xs font-medium text-[#D6CCE8]">Direct Studio Desk</p>
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="mailto:aa2993816@gmail.com"
                  className="font-mono text-sm font-medium text-[#E5C158] hover:text-[#F3D87D] transition-colors"
                >
                  aa2993816@gmail.com
                </a>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#1B1032]/90 hover:bg-[#271847] text-[#F7F3EA] border border-[#3F2D63] rounded-md transition-colors cursor-pointer whitespace-nowrap"
                >
                  {emailCopied ? <Check className="w-3.5 h-3.5 text-[#D4AF37]" /> : <Copy className="w-3.5 h-3.5" />}
                  {emailCopied ? 'Copied' : 'Copy Email'}
                </button>
                <a
                  href="https://drive.google.com/file/d/1VAPPwQHoKq89aVW2Pm1sOuX6a97PUP7k/view?usp=drive_link"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#1B1032]/90 hover:bg-[#271847] text-[#E5C158] border border-[#3F2D63] rounded-md transition-colors whitespace-nowrap"
                >
                  View Resume (PDF)
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
              <p className="text-xs text-[#C6BAE0]">
                Based in Karachi, Pakistan · Available worldwide for remote work
              </p>
            </div>
          </div>

          {/* Right Column Form */}
          <div className="lg:col-span-7 bg-[#140B26]/88 backdrop-blur-md border border-[#3F2D63]/80 rounded-2xl p-6 md:p-8">
            {submitted ? (
              <div className="py-10 space-y-4">
                <div className="w-10 h-10 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] flex items-center justify-center">
                  <Check className="w-5 h-5" />
                </div>
                <h3 className="font-display text-2xl font-bold text-[#F5F2EB]">
                  Brief received, {name.trim()}.
                </h3>
                <p className="text-[15px] leading-relaxed text-[#A8A0BA] max-w-lg tracking-[0.01em]">
                  Thank you for sharing details regarding{' '}
                  <span className="text-[#F5F2EB] font-medium">
                    {selectedScopes.length > 0 ? selectedScopes.join(', ') : 'your project'}
                  </span>
                  . I will review your note and respond to{' '}
                  <span className="font-mono text-xs text-[#D4AF37]">{email.trim()}</span> within one business day.
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <a
                    href={`mailto:aa2993816@gmail.com?subject=${encodeURIComponent(
                      `Project Inquiry from ${name.trim()}`
                    )}&body=${encodeURIComponent(
                      `Name: ${name.trim()}\nEmail: ${email.trim()}\nScope: ${
                        selectedScopes.join(', ') || 'General'
                      }\n\n${message.trim()}`
                    )}`}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#130A24] bg-[#D4AF37] hover:bg-[#E5C158] rounded-lg transition-colors"
                  >
                    Open in Mail App
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setName('');
                      setEmail('');
                      setMessage('');
                    }}
                    className="px-4 py-2 text-sm font-medium text-[#F5F2EB] bg-[#1B1726] hover:bg-[#2B253A] border border-[#2B253A] rounded-lg transition-colors cursor-pointer"
                  >
                    Send Another Inquiry
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-6">
                <div>
                  <span className="block text-xs font-medium text-[#A8A0BA] mb-2.5">
                    Project Scope
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {SCOPE_OPTIONS.map((scope) => {
                      const active = selectedScopes.includes(scope);
                      return (
                        <button
                          key={scope}
                          type="button"
                          onClick={() => toggleScope(scope)}
                          aria-pressed={active}
                          className={`px-3.5 py-2 text-xs font-medium rounded-lg border transition-colors duration-150 cursor-pointer whitespace-nowrap ${
                            active
                              ? 'bg-[#7C5CFA] text-white border-[#7C5CFA]'
                              : 'bg-[#09080D] text-[#A8A0BA] border-[#2B253A] hover:text-[#F5F2EB]'
                          }`}
                        >
                          {scope}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="block text-xs font-medium text-[#A8A0BA] mb-1.5"
                    >
                      Your Name
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Elena Rostova"
                      className="w-full px-3.5 py-2.5 text-sm text-[#F5F2EB] placeholder:text-[#6B647D] bg-[#09080D] border border-[#2B253A] rounded-lg focus:outline-none focus:border-[#D4AF37] transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="contact-email"
                      className="block text-xs font-medium text-[#A8A0BA] mb-1.5"
                    >
                      Email Address
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="elena@company.com"
                      className="w-full px-3.5 py-2.5 text-sm text-[#F5F2EB] placeholder:text-[#6B647D] bg-[#09080D] border border-[#2B253A] rounded-lg focus:outline-none focus:border-[#D4AF37] transition-colors"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="contact-message"
                    className="block text-xs font-medium text-[#A8A0BA] mb-1.5"
                  >
                    Project Outline &amp; Timeline
                  </label>
                  <textarea
                    id="contact-message"
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Share a brief overview of what you are building, key goals, and target launch window..."
                    className="w-full px-3.5 py-2.5 text-sm text-[#F5F2EB] placeholder:text-[#6B647D] bg-[#09080D] border border-[#2B253A] rounded-lg focus:outline-none focus:border-[#D4AF37] transition-colors resize-y"
                    required
                  />
                </div>

                {errorMsg && (
                  <p role="alert" className="text-xs font-medium text-[#FCA5A5]">
                    {errorMsg}
                  </p>
                )}

                <div className="flex items-center justify-between gap-4 pt-1">
                  <span className="text-xs text-[#8A829E]">
                    Typical engagement: 4–10 weeks
                  </span>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-[#09080D] bg-[#D4AF37] hover:bg-[#E5C158] rounded-lg transition-colors duration-150 cursor-pointer whitespace-nowrap"
                  >
                    Send Project Brief
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
