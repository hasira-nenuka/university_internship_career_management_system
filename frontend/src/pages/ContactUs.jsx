import React from 'react';
import { FaEnvelope, FaLocationDot, FaPhone, FaPaperPlane } from 'react-icons/fa6';

const contactItems = [
  {
    icon: <FaEnvelope />,
    label: 'Email',
    value: 'support@stepin.edu',
    accent: 'from-cyan-500 to-sky-500',
  },
  {
    icon: <FaPhone />,
    label: 'Phone',
    value: '+94 11 234 5678',
    accent: 'from-indigo-500 to-violet-500',
  },
  {
    icon: <FaLocationDot />,
    label: 'Address',
    value: 'Colombo, Sri Lanka',
    accent: 'from-fuchsia-500 to-pink-500',
  },
];

const ContactUs = () => {
  return (
    <section className="min-h-[70vh] bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),_transparent_20%),radial-gradient(circle_at_bottom_right,_rgba(99,102,241,0.18),_transparent_24%),linear-gradient(180deg,_#ecfeff_0%,_#f8fafc_42%,_#eef2ff_100%)]">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-slate-950 text-white shadow-[0_35px_100px_rgba(15,23,42,0.2)]">
          <div className="absolute inset-0 opacity-80">
            <div className="absolute -left-16 top-10 h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl" />
            <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
            <div className="absolute bottom-0 left-1/3 h-44 w-44 rounded-full bg-fuchsia-400/20 blur-3xl" />
          </div>

          <div className="relative px-8 py-12 lg:px-10">
            <p className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
              Contact Us
            </p>
            <h1 className="mt-6 text-4xl font-black leading-tight md:text-5xl">
              Let’s stay connected
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
              We are here to help students, companies, and university coordinators.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[2rem] border border-slate-200/80 bg-white/88 p-7 shadow-[0_22px_60px_rgba(148,163,184,0.18)] backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-cyan-500 text-2xl text-white shadow-lg">
                <FaPaperPlane />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900">Reach Us</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Contact our team using the details below.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {contactItems.map((item) => (
                <div
                  key={item.label}
                  className="rounded-[1.6rem] border border-slate-200/80 bg-slate-50/90 p-5"
                >
                  <div className="flex items-center gap-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${item.accent} text-lg text-white shadow-md`}>
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                        {item.label}
                      </p>
                      <p className="mt-1 text-base font-semibold text-slate-800">
                        {item.value}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <form className="rounded-[2rem] border border-slate-200/80 bg-white/88 p-7 shadow-[0_22px_60px_rgba(148,163,184,0.18)] backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500 to-indigo-500 text-2xl text-white shadow-lg">
                <FaEnvelope />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900">Send a Message</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Fill in the form and send your message.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <input
                type="text"
                placeholder="Your Name"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white"
              />
              <input
                type="email"
                placeholder="Your Email"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white"
              />
              <textarea
                rows="5"
                placeholder="Your Message"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white"
              />
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:scale-[1.02]"
              >
                <FaPaperPlane />
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactUs;
