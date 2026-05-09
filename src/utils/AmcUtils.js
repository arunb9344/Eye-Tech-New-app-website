export const isAmcExpired = (amc) => {
  if (!amc) return false;
  
  // 1. Explicitly marked as Expired
  if (amc.status === 'Expired') return true;
  
  // Only check other conditions if it's Approved
  if (amc.status !== 'Approved') return false;

  // 2. Validity Date passed
  if (amc.validityUpto && amc.validityUpto < Date.now()) return true;

  // 3. Both visits exhausted
  const breakdownLeft = amc.breakdownVisitsLeft || 0;
  const maintenanceLeft = amc.maintenanceVisitsLeft || 0;
  if (breakdownLeft <= 0 && maintenanceLeft <= 0) return true;

  return false;
};

export const getExpiryReason = (amc) => {
  if (!amc) return "";
  
  if (amc.status === 'Expired') return "Manually expired by Admin";
  
  if (amc.status !== 'Approved') return "";

  if (amc.validityUpto && amc.validityUpto < Date.now()) {
    return "Validity period expired";
  }

  const breakdownLeft = amc.breakdownVisitsLeft || 0;
  const maintenanceLeft = amc.maintenanceVisitsLeft || 0;
  if (breakdownLeft <= 0 && maintenanceLeft <= 0) {
    return "All service visits exhausted";
  }

  return "";
};
