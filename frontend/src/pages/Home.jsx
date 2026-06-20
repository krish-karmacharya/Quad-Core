import { useState } from 'react';
import { Link } from 'react-router-dom';
import ImageUpload from '../components/ImageUpload';
import Loader from '../components/Loader';
import api from '../services/api';

const Home = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [uploadKey, setUploadKey] = useState(0);

  const isAuthenticated = Boolean(localStorage.getItem('user'));

  const handleUpload = async (file) => {
    setIsLoading(true);
    setResult(null);
    setError(null);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await api.analyzeImage(formData);
      if (response.success) {
        setResult(response.data);
      } else {
        setError(response.message || 'Analysis failed. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || 
        err.message || 
        'An error occurred during analysis. Please check that all services are online.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setUploadKey((prev) => prev + 1);
  };

  // Render authenticated workspace (Clean, Centered single-column layout)
  if (isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-61px)] bg-slate-950 text-white px-5 py-10 flex items-center justify-center">
        <div className="w-full max-w-4xl">
          {result ? (
            /* Success confirmation view */
            <div className="w-full max-w-md mx-auto border border-slate-800 bg-slate-900 rounded-2xl p-8 flex flex-col items-center text-center transition duration-200 hover:border-slate-700 shadow-xl">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6 text-emerald-400 animate-pulse">
                <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-100 mb-2">Report Submitted Successfully</h3>
              <p className="text-slate-400 text-sm max-w-sm mb-8 leading-6">
                The vehicle image has been successfully uploaded and analyzed. A record has been created and sent to the administrator review queue.
              </p>
              <button
                type="button"
                onClick={handleReset}
                className="minimal-primary rounded-xl px-8 py-3 font-semibold text-sm transition text-center hover:scale-[1.02] active:scale-[0.98] w-full"
              >
                Analyze Another Image
              </button>
            </div>
          ) : (
            /* Upload view with workflow underneath */
            <div className="flex flex-col gap-6">
              <div className="max-w-xl mx-auto w-full flex flex-col gap-6">
                <h2 className="text-xl font-semibold text-slate-200 text-center">Vehicle Image Analysis</h2>
                <ImageUpload key={uploadKey} onUpload={handleUpload} isLoading={isLoading} />

                {isLoading && (
                  <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <Loader message="Analyzing image and reading plate data..." />
                  </div>
                )}

                {error && (
                  <div className="w-full bg-rose-500/10 border border-rose-500/25 rounded-2xl p-5 text-rose-400">
                    <h3 className="font-semibold text-base mb-1">Analysis Error</h3>
                    <p className="text-sm">{error}</p>
                  </div>
                )}
              </div>

              {/* Workflow section below upload */}
              <div className="mt-8 border-t border-slate-900 pt-8">
                <h3 className="text-lg font-semibold mb-6 text-slate-200 text-center font-semibold">How the Workflow Works</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-left">
                  <div className="border border-slate-800 bg-slate-900/50 rounded-xl p-5 hover:border-slate-850 hover:bg-slate-900 transition duration-200">
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 block mb-2">Step 01</span>
                    <span className="block font-semibold text-slate-200 text-base mb-1">Image Upload</span>
                    <p className="text-slate-400 leading-6">
                      Drop or select a vehicle photo. Requires a signed-in user session to register requests.
                    </p>
                  </div>
                  <div className="border border-slate-800 bg-slate-900/50 rounded-xl p-5 hover:border-slate-850 hover:bg-slate-900 transition duration-200">
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 block mb-2">Step 02</span>
                    <span className="block font-semibold text-slate-200 text-base mb-1">AI Scan & OCR</span>
                    <p className="text-slate-400 leading-6">
                      The platform analyzes the photo to identify smoke plumes and extracts the vehicle's license plate.
                    </p>
                  </div>
                  <div className="border border-slate-800 bg-slate-900/50 rounded-xl p-5 hover:border-slate-850 hover:bg-slate-900 transition duration-200">
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 block mb-2">Step 03</span>
                    <span className="block font-semibold text-slate-200 text-base mb-1">Admin Validation</span>
                    <p className="text-slate-400 leading-6">
                      A report record is queued for admins to verify the read confidence and update statuses.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render unauthenticated public view (Intro on Left, Login CTA on Right, Workflow underneath)
  return (
    <div className="min-h-[calc(100vh-61px)] bg-slate-950 text-white px-5 py-10">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-10 items-start">
        <section className="pt-4">
          <p className="text-xs uppercase tracking-wider text-slate-500 mb-4">Vehicle analysis</p>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight leading-tight text-slate-950">
            Smoke and plate detection in one quiet workflow.
          </h1>
          <p className="text-slate-500 text-base mt-5 max-w-xl leading-7">
            Upload a vehicle image to detect smoke emissions, read license plates, and create a reviewable record for administrators.
          </p>
        </section>

        <section className="w-full flex flex-col gap-6">
          <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 flex flex-col items-center text-center transition duration-200 hover:border-slate-700">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6 text-emerald-400">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-100 mb-2">Sign in to upload images</h2>
            <p className="text-slate-400 text-sm max-w-sm mb-8 leading-6">
              Analyzing vehicle emissions and detecting license plates requires an active user session. Sign in or register to get started.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link
                to="/login"
                className="minimal-primary rounded-xl px-8 py-3 font-semibold text-sm transition text-center hover:scale-[1.02] active:scale-[0.98]"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="border border-slate-700 bg-slate-950/50 hover:bg-slate-900 text-slate-200 rounded-xl px-8 py-3 font-semibold text-sm transition text-center hover:scale-[1.02] active:scale-[0.98]"
              >
                Create Account
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* Workflow Explanation Block */}
      <div className="max-w-6xl mx-auto mt-16 border-t border-slate-900 pt-10">
        <h2 className="text-xl font-semibold mb-6 text-slate-200">How the Workflow Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div className="border border-slate-800 bg-slate-900/50 rounded-xl p-5 hover:border-slate-800 hover:bg-slate-900 transition duration-200">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 block mb-2">Step 01</span>
            <span className="block font-semibold text-slate-200 text-base mb-1">Image Upload</span>
            <p className="text-slate-400 leading-6">
              Drop or select a vehicle photo. Requires a signed-in user session to register requests.
            </p>
          </div>
          <div className="border border-slate-800 bg-slate-900/50 rounded-xl p-5 hover:border-slate-800 hover:bg-slate-900 transition duration-200">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 block mb-2">Step 02</span>
            <span className="block font-semibold text-slate-200 text-base mb-1">AI Scan & OCR</span>
            <p className="text-slate-400 leading-6">
              The platform analyzes the photo to identify smoke plumes and extracts the vehicle's license plate.
            </p>
          </div>
          <div className="border border-slate-800 bg-slate-900/50 rounded-xl p-5 hover:border-slate-800 hover:bg-slate-900 transition duration-200">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 block mb-2">Step 03</span>
            <span className="block font-semibold text-slate-200 text-base mb-1">Admin Validation</span>
            <p className="text-slate-400 leading-6">
              A report record is queued for admins to verify the read confidence and update statuses.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
