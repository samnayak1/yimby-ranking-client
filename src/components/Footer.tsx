import { useState, type FormEvent } from 'react';
import { contactApi } from '../services/api.service';

type Status = 'idle' | 'sending' | 'sent' | 'error';

const MAX_MESSAGE = 2000;

function ContactForm() {
  const [message, setMessage] = useState('');
  const [contact, setContact] = useState('');
  const [website, setWebsite] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');

  const tooShort = message.trim().length < 5;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (tooShort || status === 'sending') return;

    setStatus('sending');
    setError('');
    try {
      await contactApi.send({
        message: message.trim(),
        contact: contact.trim() || undefined,
        website: website || undefined,
      });
      setStatus('sent');
      setMessage('');
      setContact('');
    } catch (err) {
      setStatus('error');
      setError((err as Error).message || 'Something went wrong. Please try again later.');
    }
  };

  if (status === 'sent') {
    return (
      <p className="text-sm sm:text-base text-gray-700">
        Thanks — your message was sent.{' '}
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="font-medium text-yimby-700 underline underline-offset-2 hover:text-yimby-800"
        >
          Send another
        </button>
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-3" noValidate>
      <label htmlFor="contact-message" className="block text-sm sm:text-base text-gray-700">
        Have any problems or want to contribute? Send a message.
      </label>

      <textarea
        id="contact-message"
        value={message}
        onChange={e => setMessage(e.target.value)}
        maxLength={MAX_MESSAGE}
        rows={3}
        required
        placeholder="Your message"
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm sm:text-base text-gray-900 placeholder:text-gray-400 focus:border-yimby-500 focus:outline-none focus:ring-2 focus:ring-yimby-200"
      />

      <input
        type="text"
        value={contact}
        onChange={e => setContact(e.target.value)}
        maxLength={200}
        aria-label="How to reach you (optional)"
        placeholder="Email or Telegram handle, if you'd like a reply (optional)"
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm sm:text-base text-gray-900 placeholder:text-gray-400 focus:border-yimby-500 focus:outline-none focus:ring-2 focus:ring-yimby-200"
      />

      {/* Honeypot: off-screen and skipped by keyboard and screen readers, so
          only bots fill it. */}
      <input
        type="text"
        name="website"
        value={website}
        onChange={e => setWebsite(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
      />

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={tooShort || status === 'sending'}
          className="inline-flex items-center justify-center rounded-lg bg-yimby-600 px-5 py-2.5 text-sm sm:text-base font-medium text-white hover:bg-yimby-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === 'sending' ? 'Sending…' : 'Send'}
        </button>
        <span className="text-xs text-gray-400">
          {message.length.toLocaleString('en-US')} / {MAX_MESSAGE.toLocaleString('en-US')}
        </span>
      </div>

      {status === 'error' && (
        <p role="alert" className="text-sm text-red-600">{error}</p>
      )}
    </form>
  );
}

export default function Footer() {
  return (
    <footer className="mt-10 sm:mt-16 border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-14">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
              This website is an independent project and is not affiliated with
              YIMBY Action.
            </h3>

            <p className="mt-3 max-w-2xl text-sm sm:text-base leading-relaxed text-gray-600">
              Regardless, if you believe in abundant housing, walkable communities, and
              evidence-based housing policy, consider supporting organizations
              advocating for these goals.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap gap-3 shrink-0">
            <a
              href="https://yimbyaction.org/?form=donate"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-yimby-600 px-6 py-3 text-base font-medium text-white hover:bg-yimby-700"
            >
              Donate to YIMBY Action
            </a>
          </div>
        </div>

        <div className="relative mt-8 border-t border-gray-100 pt-6">
          <ContactForm />
        </div>
      </div>
    </footer>
  );
}
