import React from 'react';

const ContactUs = () => {
  return (
    <section className="min-h-[70vh] bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="mb-4 text-4xl font-extrabold text-gray-900">Contact Us</h1>
        <p className="mb-10 text-lg text-gray-600">We are here to help students, companies, and university coordinators.</p>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl bg-white p-6 shadow-md">
            <h2 className="mb-4 text-2xl font-bold text-indigo-700">Reach Us</h2>
            <p className="mb-2 text-gray-600">Email: support@stepin.edu</p>
            <p className="mb-2 text-gray-600">Phone: +94 11 234 5678</p>
            <p className="text-gray-600">Address: Colombo, Sri Lanka</p>
          </div>

          <form className="rounded-2xl bg-white p-6 shadow-md">
            <h2 className="mb-4 text-2xl font-bold text-indigo-700">Send a Message</h2>
            <div className="space-y-3">
              <input type="text" placeholder="Your Name" className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-indigo-500" />
              <input type="email" placeholder="Your Email" className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-indigo-500" />
              <textarea rows="4" placeholder="Your Message" className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-indigo-500" />
              <button type="button" className="rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2 text-white hover:opacity-95">
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
