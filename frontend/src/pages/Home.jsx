import React, { useState } from 'react';
import ImageUpload from '../components/ImageUpload';
import ResultCard from '../components/ResultCard';
import Loader from '../components/Loader';
import api from '../services/api';
<<<<<<< HEAD
import axios from 'axios';

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = reader.result.split(',')[1];
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
  });
};
=======
>>>>>>> de51b544a16e662f1960cb6870577fde98387456

const Home = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleUpload = async (file) => {
    setIsLoading(true);
    setResult(null);
    setError(null);

<<<<<<< HEAD
    try {
      // 1. Prepare FormData for the backend
      const formData = new FormData();
      formData.append('image', file);


      // 4. Send to backend for license plate detection and database storage
=======
    const formData = new FormData();
    formData.append('image', file);

    try {
>>>>>>> de51b544a16e662f1960cb6870577fde98387456
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

  return (
    <div className="min-h-[calc(100vh-73px)] bg-slate-950 text-white flex flex-col items-center py-12 px-6">
      {/* Hero section */}
      <div className="max-w-3xl text-center flex flex-col gap-4 mb-12">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
          AI Vehicle Smoke &{' '}
          <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            License Plate Detection
          </span>
        </h1>
        <p className="text-slate-400 text-lg md:text-xl font-medium">
          Upload an image of a vehicle. Our serverless AI detects smoke emissions, crops and parses Nepali/English license plates, and queues records for admin review.
        </p>
      </div>

      <div className="w-full flex flex-col gap-8">
        {/* Upload Component */}
        <ImageUpload onUpload={handleUpload} isLoading={isLoading} />

        {/* Loading Spinner */}
        {isLoading && (
          <div className="w-full max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <Loader message="Uploading image to secure servers, executing smoke segmentation, and processing license plates..." />
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="w-full max-w-2xl mx-auto bg-rose-500/10 border border-rose-500/25 rounded-2xl p-6 text-center text-rose-400">
            <svg className="w-8 h-8 mx-auto mb-2 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="font-bold text-lg mb-1">Analysis Error</h3>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Results Component */}
        {result && (
          <div className="w-full">
            <ResultCard result={result} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
