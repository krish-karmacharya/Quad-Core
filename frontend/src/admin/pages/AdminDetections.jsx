import { useEffect, useState } from 'react';
import AdminNavbar from '../components/AdminNavbar';
import AdminSidebar from '../components/AdminSidebar';
import DetectionReviewCard from '../components/DetectionReviewCard';
import Loader from '../../components/Loader';
import { getAdminDetections, deleteAdminDetection } from '../services/adminApi';

const AdminDetections = () => {
  const [detections, setDetections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Selected filter key
  const [activeFilter, setActiveFilter] = useState('ALL');

  const filterOptions = [
    { label: 'All', key: 'ALL', params: {} },
    { label: 'Pending', key: 'PENDING', params: { reviewStatus: 'PENDING' } },
    { label: 'Verified', key: 'VERIFIED', params: { reviewStatus: 'VERIFIED' } },
    { label: 'Rejected', key: 'REJECTED', params: { reviewStatus: 'REJECTED' } },
    { label: 'Smoke Detected', key: 'SMOKE_DETECTED', params: { smokeDetected: 'true' } },
    { label: 'No Smoke', key: 'NO_SMOKE', params: { smokeDetected: 'false' } },
    { label: 'Plate Detected', key: 'PLATE_DETECTED', params: { plateDetected: 'true' } },
    { label: 'Plate Not Found', key: 'PLATE_NOT_FOUND', params: { plateDetected: 'false' } }
  ];

  const fetchDetections = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const activeOpt = filterOptions.find(opt => opt.key === activeFilter);
      const params = activeOpt ? activeOpt.params : {};
      const response = await getAdminDetections(params);
      if (response.success) {
        setDetections(response.data || []);
      } else {
        setError(response.message || 'Failed to fetch detections.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred loading queue. Make sure backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await deleteAdminDetection(id);
      if (response.success) {
        setDetections(detections.filter(d => d._id !== id));
      } else {
        alert(response.message || 'Delete operation failed.');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting: ' + err.message);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDetections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilter]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <AdminNavbar />
      <div className="flex">
        <AdminSidebar />
        
        {/* Main Content Pane */}
        <main className="flex-1 pl-60 pt-16 min-h-screen">
          <div className="p-8 max-w-5xl mx-auto flex flex-col gap-6">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">Detections</h1>
              <p className="text-slate-400 text-sm mt-1">Filter, review, and close reports.</p>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-4">
              {filterOptions.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setActiveFilter(opt.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wider transition ${
                    activeFilter === opt.key
                      ? 'minimal-primary font-semibold'
                      : 'bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* List Section */}
            {isLoading ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 flex justify-center">
                <Loader message="Loading queue..." />
              </div>
            ) : error ? (
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-6 text-center text-rose-400">
                <p>{error}</p>
              </div>
            ) : detections.length === 0 ? (
              <div className="text-center py-12 bg-slate-900/50 rounded-2xl border border-slate-800 p-6">
                <p className="text-slate-500 italic text-sm">No records match the current filter.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {detections.map((det) => (
                  <DetectionReviewCard key={det._id} detection={det} onDelete={handleDelete} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDetections;
