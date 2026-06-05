"use client";

import Link from "next/link";
import { FileJson } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-3">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="p-2 bg-[#00DDB3] rounded-lg">
                <FileJson className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">TinyLottie</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-3xl">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Privacy Policy</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-12 text-sm">Last updated: April 19, 2026</p>

        <div className="prose prose-gray dark:prose-invert max-w-none space-y-10 text-gray-700 dark:text-gray-300 leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">1. Overview</h2>
            <p>
              TinyLottie ("we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains what data we collect,
              how we use it, and your rights regarding your personal information when you use <strong>tinylottie.com</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">2. Data We Collect</h2>
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 mt-4">2.1 Files you optimize</h3>
            <p>
              <strong>Your Lottie animation files are never uploaded to our servers.</strong> All optimization processing happens
              entirely in your browser using the HTML5 Canvas API and JavaScript. We have zero access to your files.
            </p>
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 mt-4">2.2 Account data (optional)</h3>
            <p>
              If you choose to sign in with Google, we store the following in Firebase:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Your Google display name and email address</li>
              <li>Your Google profile photo URL</li>
              <li>Your PRO license status (whether you have redeemed a PRO coupon)</li>
            </ul>
            <p className="mt-3">Sign-in is optional. You may use TinyLottie's free optimization tools without creating an account.</p>
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 mt-4">2.3 Analytics</h3>
            <p>
              We use <strong>Google Analytics</strong> and <strong>Vercel Analytics</strong> to collect anonymous usage data
              (page views, session duration, country). No personally identifiable information is attached to analytics events.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">3. How We Use Your Data</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>To provide and improve the TinyLottie service</li>
              <li>To verify your PRO license upon redemption of a coupon code</li>
              <li>To understand aggregate usage patterns and optimize performance</li>
            </ul>
            <p className="mt-3">We do not sell, rent, or share your personal data with third parties for marketing purposes.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">4. Third-Party Services</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Firebase / Google Cloud</strong> — authentication and database (Google Privacy Policy applies)</li>
              <li><strong>Vercel</strong> — hosting and edge functions</li>
              <li><strong>Google Analytics</strong> — anonymous usage metrics</li>
              <li><strong>Lemon Squeezy</strong> — payment processing for PRO licenses (Lemon Squeezy Privacy Policy applies)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">5. Data Retention</h2>
            <p>
              Your account data (name, email, PRO status) is retained for as long as your account exists. You may request deletion
              at any time by contacting us at the email below. Analytics data is retained according to Google Analytics default settings (26 months).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">6. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Access the personal data we hold about you</li>
              <li>Request correction or deletion of your data</li>
              <li>Withdraw consent at any time by deleting your account</li>
            </ul>
            <p className="mt-3">
              To exercise these rights, contact us at{" "}
              <a href="mailto:emir.kalayci@gmail.com" className="text-[#00DDB3] hover:underline font-medium">
                emir.kalayci@gmail.com
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">7. Cookies</h2>
            <p>
              We use strictly necessary cookies for session management (Firebase Auth). Analytics cookies may be set by Google Analytics.
              We do not use advertising or tracking cookies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">8. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Changes will be reflected by updating the "Last updated" date above.
              Continued use of TinyLottie after changes constitutes your acceptance of the revised policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">9. Contact</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at{" "}
              <a href="mailto:emir.kalayci@gmail.com" className="text-[#00DDB3] hover:underline font-medium">
                emir.kalayci@gmail.com
              </a>.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 mt-12 py-8 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 text-center">
          <Link href="/" className="text-sm text-[#00DDB3] hover:underline font-medium">
            ← Back to TinyLottie
          </Link>
        </div>
      </footer>
    </div>
  );
}
