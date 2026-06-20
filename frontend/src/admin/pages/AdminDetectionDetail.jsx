import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AdminNavbar from '../components/AdminNavbar';
import AdminSidebar from '../components/AdminSidebar';
import ReviewStatusBadge from '../components/ReviewStatusBadge';
import Loader from '../../components/Loader';
import { getAdminDetectionById, verifyDetection, rejectDetection } from '../services/adminApi';

const AdminDetectionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [detection, setDetection] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form states
  const [correctedPlateText, setCorrectedPlateText] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchDetail = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getAdminDetectionById(id);
      if (response.success) {
        setDetection(response.data);
        // Pre-fill form inputs
        setNote(response.data.adminReview?.note || '');
        setCorrectedPlateText(
          response.data.adminReview?.correctedPlateText || 
          response.data.licensePlateDetection?.plates?.[0]?.plateTextNormalized || 
          response.data.licensePlateDetection?.plates?.[0]?.plateTextOriginal || 
          ''
        );
      } else {
        setError(response.message || 'Failed to retrieve detection details.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred loading detail. Verify if backend is reachable.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleVerify = async () => {
    setSubmitting(true);
    try {
      const response = await verifyDetection(id, { note, correctedPlateText });
      if (response.success) {
        alert('Detection record verified successfully!');
        navigate('/admin/detections');
      } else {
        alert(response.message || 'Verification failed.');
      }
    } catch (err) {
      console.error(err);
      alert('Verification error: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!note.trim()) {
      alert("A rejection note is required to explain why this case is rejected.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await rejectDetection(id, { note });
      if (response.success) {
        alert('Detection record rejected.');
        navigate('/admin/detections');
      } else {
        alert(response.message || 'Rejection failed.');
      }
    } catch (err) {
      console.error(err);
      alert('Rejection error: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <AdminNavbar />
        <div className="flex">
          <AdminSidebar />
          <main className="flex-1 pl-64 pt-16 min-h-screen flex justify-center items-center">
            <Loader message="Loading report detail context..." />
          </main>
        </div>
      </div>
    );
  }

  if (error || !detection) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <AdminNavbar />
        <div className="flex">
          <AdminSidebar />
          <main className="flex-1 pl-64 pt-16 min-h-screen p-8 flex flex-col gap-4">
            <Link to="/admin/detections" className="text-emerald-400 text-sm hover:underline flex items-center gap-1">
              ← Back to Queue
            </Link>
            <div className="bg-rose-500/10 border border-rose-500/25 rounded-2xl p-6 text-center text-rose-400">
              <h3 className="font-bold text-lg mb-1">Retrieval Error</h3>
              <p className="text-sm">{error || 'Detection details could not be loaded.'}</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const {
    imagePath,
    originalFileName,
    smokeDetection = {},
    licensePlateDetection = {},
    reviewStatus,
    adminReview = {}
  } = detection;

  const backendUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
  const fullImageUrl = `${backendUrl}/${imagePath}`;

  const smokeConfidence = smokeDetection.detections?.[0]?.confidence ?? 0;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <AdminNavbar />
      <div className="flex">
        <AdminSidebar />

        <main className="flex-1 pl-64 pt-16 min-h-screen">
          <div className="p-8 max-w-5xl mx-auto flex flex-col gap-6">
            <div className="flex justify-between items-center flex-wrap gap-4 border-b border-slate-800 pb-4">
              <div>
                <Link to="/admin/detections" className="text-slate-550 hover:text-slate-300 text-xs font-semibold hover:underline mb-1 block">
                  ← Back to Queue
                </Link>
                <h1 className="text-2xl font-black text-slate-100 flex items-center gap-3">
                  Review Report Details
                  <ReviewStatusBadge status={reviewStatus} />
                </h1>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Image Context (7/12) */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                <div className="bg-slate-905 border border-slate-800 p-3 rounded-2xl overflow-hidden shadow-lg aspect-video flex justify-center items-center">
                  <img
                    src={fullImageUrl}
                    alt={originalFileName}
                    className="max-h-full max-w-full object-contain rounded-lg"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-xs text-slate-400">
                  <div className="grid grid-cols-2 gap-2">
                    <div><span className="text-slate-500 block font-medium">Record ID:</span> <span className="font-mono text-slate-200">{detection._id}</span></div>
                    <div><span className="text-slate-500 block font-medium">Filename:</span> <span className="text-slate-200">{originalFileName}</span></div>
                    <div><span className="text-slate-500 block font-medium">Uploaded At:</span> <span className="text-slate-200">{new Date(detection.createdAt).toLocaleString()}</span></div>
                    <div><span className="text-slate-500 block font-medium">Review Status:</span> <span className="text-slate-200">{reviewStatus}</span></div>
                  </div>
                </div>
              </div>

              {/* Right Column: Decisions (5/12) */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                {/* AI Outputs summary */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col gap-4">
                  <h3 className="font-bold text-slate-200 text-sm border-b border-slate-800 pb-2">AI Predictions Summary</h3>
                  
                  {/* Smoke */}
                  <div>
                    <span className="text-slate-500 text-xs uppercase block font-semibold tracking-wider">Smoke AI:</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`w-2.5 h-2.5 rounded-full ${smokeDetection.smokeDetected ? 'bg-orange-500' : 'bg-slate-500'}`}></span>
                      <span className="font-bold text-slate-200 text-sm">
                        {smokeDetection.smokeDetected ? `Smoke Detected (${(smokeConfidence * 100).toFixed(1)}%)` : 'No Smoke'}
                      </span>
                    </div>
                  </div>

                  {/* Plates */}
                  <div>
                    <span className="text-slate-500 text-xs uppercase block font-semibold tracking-wider">License Plate Recognition:</span>
                    {!licensePlateDetection.performed ? (
                      <p className="text-slate-400 text-xs italic mt-1 bg-slate-950 p-2 rounded border border-slate-800">
                        Skipped: {licensePlateDetection.reason}
                      </p>
                    ) : licensePlateDetection.totalPlates === 0 ? (
                      <p className="text-slate-400 text-xs italic mt-1 bg-slate-950 p-2 rounded border border-slate-805 border-slate-800">
                        Plate Not Found
                      </p>
                    ) : (
                      <div className="flex flex-col gap-2 mt-2">
                        {licensePlateDetection.plates?.map((plate, index) => (
                          <div key={index} className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs flex flex-col gap-2">
                            <div>
                              <span className="text-slate-500 text-[10px] block">Original OCR Reading:</span>
                              <span className="font-mono text-sm font-semibold text-slate-200">{plate.plateTextOriginal}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 text-[10px] block">Normalized OCR Reading:</span>
                              <span className="font-mono text-sm font-bold text-emerald-400">{plate.plateTextNormalized}</span>
                            </div>
                            <div className="flex justify-between text-[10px] text-slate-500 mt-1 border-t border-slate-900 pt-1">
                              <span>YOLO: {(plate.yoloConfidence * 100).toFixed(0)}%</span>
                              <span>OCR: {(plate.ocrConfidence * 100).toFixed(0)}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Form Controls */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col gap-4">
                  <h3 className="font-bold text-slate-200 text-sm border-b border-slate-800 pb-2">Verification Actions</h3>

                  <div className="flex flex-col gap-1">
                    <label htmlFor="corrected-plate-input" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Verify/Correct Plate Number
                    </label>
                    <input
                      type="text"
                      id="corrected-plate-input"
                      value={correctedPlateText}
                      onChange={(e) => setCorrectedPlateText(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-400 transition font-mono font-bold"
                      placeholder="e.g. बा २ च १२३४"
                      disabled={submitting || reviewStatus !== 'PENDING'}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label htmlFor="admin-note-input" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Review Comments / Reason
                    </label>
                    <textarea
                      id="admin-note-input"
                      rows="3"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-200 focus:outline-none focus:border-emerald-400 transition text-sm"
                      placeholder="Enter verification notes or rejection reasons..."
                      disabled={submitting || reviewStatus !== 'PENDING'}
                    />
                  </div>

                  {reviewStatus === 'PENDING' ? (
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <button
                        onClick={handleReject}
                        disabled={submitting}
                        className="bg-slate-950 hover:bg-slate-800 text-rose-500 border border-rose-500/20 font-bold py-2.5 rounded-xl transition cursor-pointer"
                      >
                        Reject Report
                      </button>
                      <button
                        onClick={handleVerify}
                        disabled={submitting}
                        className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-2.5 rounded-xl transition cursor-pointer"
                      >
                        Verify Report
                      </button>
                    </div>
                  ) : (
                    <div className="bg-slate-950 p-4 border border-slate-800 rounded-xl mt-2 text-xs text-slate-400 text-center">
                      This record has already been reviewed and closed as <span className="font-bold text-white">{reviewStatus}</span>.
                      {adminReview.reviewedBy && (
                        <p className="mt-1 text-slate-500">Reviewed by {adminReview.reviewedBy.name || 'Admin'} on {new Date(adminReview.reviewedAt).toLocaleDateString()}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDetectionDetail;
