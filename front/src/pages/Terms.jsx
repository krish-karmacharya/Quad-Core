import { Link } from 'react-router-dom'
import Header from '../ui/header.jsx'
import Footer from '../ui/footer.jsx'

function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-950">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-6 py-16 lg:px-8">
          <Link
            to="/"
            className="text-sm font-semibold text-indigo-400 hover:text-indigo-300"
          >
            &larr; Back to home
          </Link>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Terms &amp; Conditions
          </h1>
          <p className="mt-4 text-sm text-gray-400">Last updated: June 19, 2026</p>

          <div className="mt-10 space-y-8 text-gray-300">
            <section>
              <h2 className="text-lg font-semibold text-white">1. Acceptance of Terms</h2>
              <p className="mt-3 text-sm/7">
                By accessing or using this website, you agree to be bound by these Terms &amp;
                Conditions. If you do not agree with any part of these terms, you may not use
                our services.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white">2. Use of Service</h2>
              <p className="mt-3 text-sm/7">
                You agree to use our services only for lawful purposes and in accordance with
                these terms. You must not use the service in any way that could damage, disable,
                or impair the website or interfere with any other party&apos;s use of the service.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white">3. Intellectual Property</h2>
              <p className="mt-3 text-sm/7">
                All content, features, and functionality on this website are owned by us and
                are protected by international copyright, trademark, and other intellectual
                property laws.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white">4. Limitation of Liability</h2>
              <p className="mt-3 text-sm/7">
                To the fullest extent permitted by applicable law, we shall not be liable for
                any indirect, incidental, special, consequential, or punitive damages arising
                out of or related to your use of the service.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white">5. Changes to Terms</h2>
              <p className="mt-3 text-sm/7">
                We reserve the right to modify these terms at any time. We will notify users of
                any material changes by updating the date at the top of this page. Your continued
                use of the service after such changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white">6. Contact</h2>
              <p className="mt-3 text-sm/7">
                If you have any questions about these Terms &amp; Conditions, please contact us
                at{' '}
                <a href="mailto:support@example.com" className="text-indigo-400 hover:text-indigo-300">
                  support@example.com
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default TermsPage
