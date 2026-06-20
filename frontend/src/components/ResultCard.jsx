const ResultCard = ({ result }) => {
  if (!result) return null;

  const {
    imagePath,
    smokeDetection = {},
    licensePlateDetection = {},
    reviewStatus,
    adminReview = {}
  } = result;

  const backendUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
  const fullImageUrl = `${backendUrl}/${imagePath}`;

  // Get status badge colors
  const getReviewStatusBadge = (status) => {
    switch (status) {
      case 'VERIFIED':
        return <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">Verified</span>;
      case 'REJECTED':
        return <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">Rejected</span>;
      default:
        return <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">Pending Review</span>;
    }
  };

  const getSmokeBadge = (detected) => {
    return detected ? (
      <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">Smoke Detected</span>
    ) : (
      <span className="bg-slate-500/10 text-slate-400 border border-slate-500/20 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">No Smoke</span>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl transition duration-300">
      <div className="bg-slate-950 p-6 border-b border-slate-800 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-100">Analysis Results</h3>
          <p className="text-xs text-slate-400">ID: {result._id}</p>
        </div>
        <div className="flex gap-2">
          {getSmokeBadge(smokeDetection.smokeDetected)}
          {getReviewStatusBadge(reviewStatus)}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
        {/* Left column: Image preview */}
        <div className="flex flex-col gap-4">
          <div className="bg-slate-950 rounded-xl border border-slate-800 p-2 overflow-hidden aspect-video flex items-center justify-center relative">
            <img
              src={fullImageUrl}
              alt="Analyzed vehicle"
              className="max-h-full max-w-full object-contain rounded"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&w=600&q=80';
              }}
            />
          </div>
          
          {/* Admin Review info if present */}
          {adminReview && (adminReview.note || adminReview.correctedPlateText || reviewStatus !== 'PENDING') && (
            <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
              <h4 className="font-semibold text-slate-200 text-sm border-b border-slate-800 pb-2">Admin Review Feedback</h4>
              {adminReview.correctedPlateText && (
                <div>
                  <span className="text-xs text-slate-400 block font-medium">Corrected License Plate:</span>
                  <span className="text-lg font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/10 inline-block mt-1">
                    {adminReview.correctedPlateText}
                  </span>
                </div>
              )}
              {adminReview.note && (
                <div>
                  <span className="text-xs text-slate-400 block font-medium">Official Note:</span>
                  <p className="text-sm text-slate-300 italic mt-1 bg-slate-900 p-2 rounded border border-slate-800">
                    "{adminReview.note}"
                  </p>
                </div>
              )}
              {!adminReview.note && !adminReview.correctedPlateText && (
                <p className="text-xs text-slate-500 italic">No notes or corrections provided by reviewer.</p>
              )}
            </div>
          )}
        </div>

        {/* Right column: AI results details */}
        <div className="flex flex-col gap-6">
          {/* Smoke Details Card */}
          <div className="bg-slate-950/30 border border-slate-800 rounded-xl p-5">
            <h4 className="font-semibold text-slate-200 text-sm border-b border-slate-800 pb-2 mb-3 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-400"></span>
              Smoke Detection Report
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-400 block text-xs">Smoke Detected:</span>
                <span className={`font-semibold ${smokeDetection.smokeDetected ? 'text-orange-400' : 'text-slate-300'}`}>
                  {smokeDetection.smokeDetected ? 'YES' : 'NO'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-xs">Total Detections:</span>
                <span className="font-semibold text-slate-200">
                  {smokeDetection.totalSmokeDetections || 0}
                </span>
              </div>
              {smokeDetection.smokeDetected && smokeDetection.detections?.length > 0 && (
                <div className="col-span-2">
                  <span className="text-slate-400 block text-xs mb-1.5">Model Confidences:</span>
                  <div className="flex flex-wrap gap-2">
                    {smokeDetection.detections.map((det, index) => (
                      <span key={index} className="bg-slate-800 px-2 py-1 rounded text-xs text-slate-300 border border-slate-700">
                        Class: {det.class} ({(det.confidence * 100).toFixed(1)}%)
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* License Plate Details Card */}
          <div className="bg-slate-950/30 border border-slate-800 rounded-xl p-5">
            <h4 className="font-semibold text-slate-200 text-sm border-b border-slate-800 pb-2 mb-3 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
              License Plate Detection & OCR
            </h4>
            
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-400 block text-xs">AI Scan Performed:</span>
                  <span className="font-semibold text-slate-200">
                    {licensePlateDetection.performed ? 'YES' : 'NO'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs">License Plate Found:</span>
                  <span className={`font-semibold ${licensePlateDetection.totalPlates > 0 ? 'text-blue-400' : 'text-slate-300'}`}>
                    {licensePlateDetection.totalPlates > 0 ? 'YES' : 'NO'}
                  </span>
                </div>
              </div>

              {licensePlateDetection.reason && (
                <p className="text-xs text-slate-400 italic bg-slate-950/60 p-2 rounded border border-slate-800/80">
                  Info: {licensePlateDetection.reason}
                </p>
              )}

              {licensePlateDetection.performed && licensePlateDetection.totalPlates > 0 && (
                <div className="flex flex-col gap-3 mt-1 pt-3 border-t border-slate-800">
                  {licensePlateDetection.plates?.map((plate, index) => (
                    <div key={index} className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-blue-400">Plate #{index + 1}</span>
                        <div className="flex gap-2 text-xs text-slate-500">
                          <span>YOLO: {(plate.yoloConfidence * 100).toFixed(0)}%</span>
                          <span>|</span>
                          <span>OCR: {(plate.ocrConfidence * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                          <span className="text-[10px] text-slate-500 block uppercase">Original Text:</span>
                          <span className="font-mono font-bold text-sm text-slate-200">
                            {plate.plateTextOriginal || 'N/A'}
                          </span>
                        </div>
                        <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                          <span className="text-[10px] text-slate-500 block uppercase">Normalized Text:</span>
                          <span className="font-mono font-bold text-sm text-emerald-400">
                            {plate.plateTextNormalized || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultCard;
