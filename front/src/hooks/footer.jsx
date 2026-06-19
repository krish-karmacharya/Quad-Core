import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-white/10">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Your Company. All rights reserved.
          </p>
          <nav aria-label="Footer" className="flex gap-6">
            <Link
              to="/terms"
              className="text-sm font-semibold text-gray-400 hover:text-white transition-colors"
            >
              Terms &amp; Conditions
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}

export default Footer
