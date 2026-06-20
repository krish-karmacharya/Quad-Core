import { useEffect, useState } from 'react';
import DetectionHistory from '../components/DetectionHistory';
import Loader from '../components/Loader';
import api from '../services/api';

const History = () => {
  const [detections, setDetections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.getDetections();
      if (response.success) {
        setDetections(response.data || []);
      } else {
        setError(response.message || 'Failed to fetch detection history.');
      }
    } catch (err) {
      console.error(err);
      setError('Error loading history. Make sure the backend server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchHistory();
  }, []);

  return (
    <div className="min-h-[calc(100vh-61px)] bg-slate-950 text-white py-10 px-5">
      <div className="max-w-6xl mx-auto flex flex-col gap-7">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Detection History</h1>
          <p className="text-slate-400 text-sm mt-1">
            Previous reports, plate readings, and review status.
          </p>
        </div>

        {isLoading ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center justify-center">
            <Loader message="Loading history..." />
          </div>
        ) : error ? (
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-6 text-center text-rose-400">
            <h3 className="font-bold text-lg mb-1">Error Loading Data</h3>
            <p className="text-sm">{error}</p>
          </div>
        ) : (
          <DetectionHistory detections={detections} />
        )}
      </div>
    </div>
  );
};

export default History;
