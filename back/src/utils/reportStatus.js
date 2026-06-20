const STATUS_TRANSITIONS = {
  pending: ['verified', 'rejected'],
  verified: ['action_taken', 'rejected', 'pending'],
  rejected: ['pending'],
  action_taken: []
};

function canTransitionStatus(currentStatus, nextStatus) {
  if (currentStatus === nextStatus) {
    return true;
  }

  const allowed = STATUS_TRANSITIONS[currentStatus] || [];
  return allowed.includes(nextStatus);
}

module.exports = { canTransitionStatus, STATUS_TRANSITIONS };
