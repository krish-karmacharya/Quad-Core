import React from 'react';

const ReviewStatusBadge = ({ status }) => {
  const getBadgeStyles = () => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'VERIFIED':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'REJECTED':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'SMOKE_DETECTED':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'PLATE_DETECTED':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'NO_SMOKE':
        return 'bg-slate-500/10 text-slate-400 border-slate-700/20';
      case 'PLATE_NOT_FOUND':
        return 'bg-slate-500/10 text-slate-400 border-slate-700/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-700/20';
    }
  };

  const getLabel = () => {
    switch (status) {
      case 'PENDING': return 'Pending';
      case 'VERIFIED': return 'Verified';
      case 'REJECTED': return 'Rejected';
      case 'SMOKE_DETECTED': return 'Smoke Detected';
      case 'PLATE_DETECTED': return 'Plate Detected';
      case 'NO_SMOKE': return 'No Smoke';
      case 'PLATE_NOT_FOUND': return 'Plate Not Found';
      default: return status || 'Unknown';
    }
  };

  return (
    <span className={`px-2.5 py-0.5 rounded text-xs font-semibold border ${getBadgeStyles()}`}>
      {getLabel()}
    </span>
  );
};

export default ReviewStatusBadge;
