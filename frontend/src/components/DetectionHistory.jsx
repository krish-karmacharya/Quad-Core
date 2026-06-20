import { useState } from 'react';
import ResultCard from './ResultCard';

const DetectionHistory = ({ detections }) => {
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getReviewStatusColor = (status) => {
    switch (status) {
      case 'VERIFIED': return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'REJECTED': return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      default: return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    }
  };

  const getSmokeColor = (detected) => {
    return detected
      ? 'bg-orange-500/15 text-orange-400 border-orange-500/30'
      : 'bg-slate-500/15 text-slate-400 border-slate-700/30';
  };

  if (!detections || detections.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-900/50 rounded-2xl border border-slate-800 p-6">
        <p className="text-slate-400 text-lg">No detection history available.</p>
        <p className="text-slate-550 text-sm mt-1">Upload a vehicle image on the home page to start!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {detections.map((item) => {
        const isExpanded = expandedId === item._id;
        const plateText = item.adminReview?.correctedPlateText || 
          item.licensePlateDetection?.plates?.[0]?.plateTextNormalized || 
          item.licensePlateDetection?.plates?.[0]?.plateTextOriginal || 
          'N/A';

        const smokeText = item.smokeDetection?.smokeDetected ? 'Smoke' : 'Clear';
        const dateStr = new Date(item.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });

        const imageBase = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';

        return (
          <div
            key={item._id}
            className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md hover:border-slate-700 transition duration-200"
          >
            {/* Header summary row */}
            <div
              className="p-4 flex flex-wrap gap-4 items-center justify-between cursor-pointer select-none bg-slate-950/40"
              onClick={() => toggleExpand(item._id)}
            >
              <div className="flex items-center gap-3">
                {/* Mini Thumbnail */}
                <div className="w-12 h-12 rounded bg-slate-950 overflow-hidden flex items-center justify-center border border-slate-800">
                  <img
                    src={`${imageBase}/${item.imagePath}`}
                    alt="Vehicle thumb"
                    className="max-h-full max-w-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&w=120&q=80';
                    }}
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-200 text-sm truncate max-w-[200px]" title={item.originalFileName}>
                    {item.originalFileName}
                  </h4>
                  <p className="text-[10px] text-slate-500">{dateStr}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                {/* Smoke Status */}
                <span className={`px-2.5 py-0.5 rounded text-xs font-semibold border ${getSmokeColor(item.smokeDetection?.smokeDetected)}`}>
                  {smokeText}
                </span>

                {/* Plate Text */}
                <span className="font-mono bg-slate-950 px-2 py-0.5 border border-slate-800 rounded text-xs font-bold text-slate-300">
                  {plateText}
                </span>

                {/* Review Status */}
                <span className={`px-2.5 py-0.5 rounded text-xs font-semibold border ${getReviewStatusColor(item.reviewStatus)}`}>
                  {item.reviewStatus}
                </span>

                {/* Actions */}
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => toggleExpand(item._id)}
                    className="text-slate-400 hover:text-white p-1 hover:bg-slate-850 rounded transition"
                    title={isExpanded ? "Collapse" : "Expand"}
                  >
                    <svg className={`w-5 h-5 transform transition ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Expandable Detail Panel */}
            {isExpanded && (
              <div className="p-4 border-t border-slate-800 bg-slate-900/50">
                <ResultCard result={item} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default DetectionHistory;
