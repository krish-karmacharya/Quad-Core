import { Link } from 'react-router-dom'
import Header from '../hooks/header.jsx'
import Footer from '../hooks/footer.jsx'

function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-950">
      <Header />
      <main className="flex flex-1 items-center justify-center px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Build something great
          </h1>
          <p className="mt-6 text-lg/8 text-gray-400">
            Welcome to our platform. Explore powerful tools designed to help you grow,
            connect with your audience, and achieve your goals — all in one place.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              to="/terms"
              className="rounded-md bg-indigo-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 transition-colors"
            >
              Get started
            </Link>
            <a href="#" className="text-sm/6 font-semibold text-white hover:text-gray-300 transition-colors">
              Learn more <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default HomePage
