import { Link } from 'react-router-dom';
import ReviewStatusBadge from './ReviewStatusBadge';

const DetectionReviewCard = ({ detection, onDelete }) => {
  const {
    _id,
    imagePath,
    originalFileName,
    smokeDetection = {},
    licensePlateDetection = {},
    reviewStatus,
    createdAt,
    status
  } = detection;

  const dateStr = new Date(createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const plateText = detection.adminReview?.correctedPlateText || 
    licensePlateDetection.plates?.[0]?.plateTextNormalized || 
    licensePlateDetection.plates?.[0]?.plateTextOriginal || 
    'N/A';

  const smokeConfidence = smokeDetection.detections?.[0]?.confidence ?? 0;

  const backendUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
  const fullImageUrl = `${backendUrl}/${imagePath}`;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition duration-200 flex flex-col sm:flex-row items-center p-4 gap-4 shadow-md w-full">
      {/* Thumbnail */}
      <div className="w-full sm:w-24 h-24 rounded-lg bg-slate-950 overflow-hidden flex items-center justify-center border border-slate-800 shrink-0">
        <img
          src={fullImageUrl}
          alt={originalFileName}
          className="max-h-full max-w-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&w=200&q=80';
          }}
        />
      </div>

      {/* Details info */}
      <div className="flex-1 min-w-0 flex flex-col gap-1 w-full text-center sm:text-left">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
          <h4 className="font-bold text-slate-100 text-sm truncate max-w-[250px]" title={originalFileName}>
            {originalFileName}
          </h4>
          <span className="text-[10px] text-slate-500 font-mono">({_id})</span>
        </div>
        
        <p className="text-[10px] text-slate-500">{dateStr}</p>
        
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-2">
          <div className="flex flex-col items-center sm:items-start text-xs">
            <span className="text-[9px] text-slate-500 uppercase font-medium">Smoke AI:</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${smokeDetection.smokeDetected ? 'bg-orange-500' : 'bg-slate-500'}`}></span>
              <span className="text-slate-300 font-semibold">{smokeDetection.smokeDetected ? 'Smoke' : 'Clear'}</span>
              {smokeDetection.smokeDetected && (
                <span className="text-slate-500">({(smokeConfidence * 100).toFixed(0)}%)</span>
              )}
            </div>
          </div>
          
          <div className="w-px h-6 bg-slate-800 hidden sm:block"></div>

          <div className="flex flex-col items-center sm:items-start text-xs">
            <span className="text-[9px] text-slate-500 uppercase font-medium">License Plate:</span>
            <span className="font-mono text-emerald-400 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800 mt-0.5">
              {plateText}
            </span>
          </div>

          <div className="w-px h-6 bg-slate-800 hidden sm:block"></div>

          <div className="flex flex-col items-center sm:items-start text-xs">
            <span className="text-[9px] text-slate-500 uppercase font-medium">System Status:</span>
            <span className="mt-0.5"><ReviewStatusBadge status={status} /></span>
          </div>
        </div>
      </div>

      {/* Review Status & Actions */}
      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4 border-t sm:border-t-0 border-slate-800 pt-4 sm:pt-0 w-full sm:w-auto shrink-0">
        <ReviewStatusBadge status={reviewStatus} />
        
        <div className="flex items-center gap-2">
          <Link
            to={`/admin/detections/${_id}`}
            className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold px-3 py-1.5 rounded transition"
          >
            Review Details
          </Link>
          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to delete this detection record?")) {
                onDelete(_id);
              }
            }}
            className="text-rose-500 hover:text-rose-400 p-1.5 hover:bg-rose-500/10 rounded transition"
            title="Delete record"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetectionReviewCard;
