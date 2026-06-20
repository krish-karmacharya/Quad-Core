const SMOKE_BASE_SCORE = {
  none: 0,
  low: 20,
  medium: 45,
  heavy: 70
};

const RECOMMENDED_ACTIONS = {
  none: 'No action required',
  low: 'Review when capacity allows',
  medium: 'Review and consider warning',
  high: 'Priority review — enforcement likely',
  critical: 'Urgent review — immediate enforcement recommended'
};

const SEVERITY_LEVELS = ['none', 'low', 'medium', 'high', 'critical'];

function severityLabelFromIndex(index) {
  if (index >= 86) return 'critical';
  if (index >= 61) return 'high';
  if (index >= 31) return 'medium';
  if (index >= 1) return 'low';
  return 'none';
}

function computeSeverity({ smokeDetected, smokeLevel, confidenceScore, licensePlateDetection }) {
  if (!smokeDetected || smokeLevel === 'none') {
    return {
      severityIndex: 0,
      severity: 'none',
      recommendedAction: RECOMMENDED_ACTIONS.none
    };
  }

  let index = SMOKE_BASE_SCORE[smokeLevel] ?? 0;
  index += Math.round((confidenceScore || 0) * 15);

  const totalPlates = Number(
    licensePlateDetection?.totalPlates ?? licensePlateDetection?.plates?.length ?? 0
  );
  if (totalPlates > 0) {
    index += 10;
  }

  index = Math.min(100, Math.max(0, index));
  const severity = severityLabelFromIndex(index);

  return {
    severityIndex: index,
    severity,
    recommendedAction: RECOMMENDED_ACTIONS[severity]
  };
}

module.exports = {
  SEVERITY_LEVELS,
  computeSeverity,
  severityLabelFromIndex
};
