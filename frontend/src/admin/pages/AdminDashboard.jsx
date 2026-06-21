import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminNavbar from '../components/AdminNavbar';
import AdminSidebar from '../components/AdminSidebar';
import StatCard from '../components/StatCard';
import ReviewStatusBadge from '../components/ReviewStatusBadge';
import Loader from '../../components/Loader';
import { getAdminDetections } from '../services/adminApi';

const AdminDashboard = () => {
  const [detections, setDetections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getAdminDetections();
        if (response.success) {
          setDetections(response.data || []);
        } else {
          setError(response.message || 'Failed to fetch dashboard data.');
        }
      } catch (err) {
        console.error(err);
        setError('Error fetching dashboard statistics. Please ensure the backend is running.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Compute metrics
  const total = detections.length;
  const pending = detections.filter(d => d.reviewStatus === 'PENDING').length;
  const verified = detections.filter(d => d.reviewStatus === 'VERIFIED').length;
  const rejected = detections.filter(d => d.reviewStatus === 'REJECTED').length;
  const smokeCases = detections.filter(d => d.smokeDetection?.smokeDetected).length;
  const plateCases = detections.filter(d => d.licensePlateDetection?.totalPlates > 0).length;

  // Get recent 5
  const recentDetections = detections.slice(0, 5);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <AdminNavbar />
      <div className="flex">
        <AdminSidebar />
        
        {/* Main container with offset for sidebar */}
        <main className="flex-1 pl-60 pt-16 min-h-screen">
          <div className="p-8 max-w-7xl mx-auto flex flex-col gap-7">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
              <p className="text-slate-400 text-sm mt-1">Report volume and review activity.</p>
            </div>

            {isLoading ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 flex justify-center">
                <Loader message="Loading dashboard..." />
              </div>
            ) : error ? (
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-6 text-center text-rose-400">
                <h3 className="font-bold text-lg mb-1">Telemetry Error</h3>
                <p className="text-sm">{error}</p>
              </div>
            ) : (
              <>
                {/* Stat Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <StatCard
                    title="Total Reports"
                    value={total}
                  />
                  <StatCard
                    title="Pending Review"
                    value={pending}
                  />
                  <StatCard
                    title="Verified Detections"
                    value={verified}
                  />
                  <StatCard
                    title="Rejected Cases"
                    value={rejected}
                  />
                  <StatCard
                    title="Smoke Detected"
                    value={smokeCases}
                  />
                  <StatCard
                    title="Plate Recognized"
                    value={plateCases}
                  />
                </div>

                {/* Recent Detections List */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mt-2">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-base font-semibold text-slate-100">Recent Uploads</h3>
                    <Link to="/admin/detections" className="text-slate-500 hover:text-slate-950 text-xs font-semibold hover:underline">
                      View queue
                    </Link>
                  </div>
                  
                  {recentDetections.length === 0 ? (
                    <p className="text-slate-500 text-sm italic">No recent uploads available in the queue.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm text-slate-300">
                        <thead className="text-[10px] text-slate-500 uppercase border-b border-slate-800 bg-slate-950/20">
                          <tr>
                            <th className="py-3 px-4">Thumbnail</th>
                            <th className="py-3 px-4">Filename</th>
                            <th className="py-3 px-4">Smoke AI</th>
                            <th className="py-3 px-4">Recognized Plate</th>
                            <th className="py-3 px-4">Review Status</th>
                            <th className="py-3 px-4">Created Date</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {recentDetections.map((det) => {
                            const date = new Date(det.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            });
                            
                            const plate = det.adminReview?.correctedPlateText || 
                              det.licensePlateDetection?.plates?.[0]?.plateTextNormalized || 
                              det.licensePlateDetection?.plates?.[0]?.plateTextOriginal || 
                              'N/A';

                            const imageBase = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';

                            return (
                              <tr key={det._id} className="hover:bg-slate-800/30 transition">
                                <td className="py-3 px-4">
                                  <div className="w-10 h-10 rounded overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-800">
                                    <img
                                      src={`${imageBase}/${det.imagePath}`}
                                      alt="Vehicle thumb"
                                      className="max-h-full max-w-full object-cover"
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&w=80&q=80';
                                      }}
                                    />
                                  </div>
                                </td>
                                <td className="py-3 px-4 font-semibold text-slate-200 truncate max-w-[150px]">{det.originalFileName}</td>
                                <td className="py-3 px-4">
                                  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${det.smokeDetection?.smokeDetected ? 'text-orange-400' : 'text-slate-400'}`}>
                                    <span className={`w-2 h-2 rounded-full ${det.smokeDetection?.smokeDetected ? 'bg-orange-500' : 'bg-slate-500'}`}></span>
                                    {det.smokeDetection?.smokeDetected ? 'Smoke' : 'Clear'}
                                  </span>
                                </td>
                                <td className="py-3 px-4 font-mono font-bold text-slate-300">{plate}</td>
                                <td className="py-3 px-4">
                                  <ReviewStatusBadge status={det.reviewStatus} />
                                </td>
                                <td className="py-3 px-4 text-xs text-slate-500">{date}</td>
                                <td className="py-3 px-4 text-right">
                                  <Link
                                    to={`/admin/detections/${det._id}`}
                                    className="bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 text-xs font-bold px-3 py-1 rounded transition border border-emerald-500/20"
                                  >
                                    Review
                                  </Link>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
