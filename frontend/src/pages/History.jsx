import React, { useEffect, useState } from 'react';
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

  const handleDelete = async (id) => {
    try {
      const response = await api.deleteDetection(id);
      if (response.success) {
        setDetections(detections.filter((item) => item._id !== id));
      } else {
        alert(response.message || 'Failed to delete record.');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting record: ' + err.message);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="min-h-[calc(100vh-73px)] bg-slate-950 text-white py-12 px-6">
      <div className="max-w-4xl mx-auto flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Detection History</h1>
          <p className="text-slate-400 text-sm mt-1">
            Browse through previous vehicle reports, AI plate recognitions, and admin verification status logs.
          </p>
        </div>

        {isLoading ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center justify-center">
            <Loader message="Fetching historical reports from database..." />
          </div>
        ) : error ? (
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-6 text-center text-rose-400">
            <h3 className="font-bold text-lg mb-1">Error Loading Data</h3>
            <p className="text-sm">{error}</p>
          </div>
        ) : (
          <DetectionHistory detections={detections} onDelete={handleDelete} />
        )}
      </div>
    </div>
  );
};

export default History;
