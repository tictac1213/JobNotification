// Utility to check if a user is eligible for a company
export function isUserEligibleForCompany(user, company) {
  if (!user || !company) return false;
  if (company.status !== 'Active') return false;
  if (company.eligibility?.minCgpa && Number(user.cgpa) < Number(company.eligibility.minCgpa)) return false;
  if (company.eligibility?.branches && company.eligibility.branches.length > 0 && !company.eligibility.branches.includes(String(user.branch))) return false;
  if (company.eligibility?.years && company.eligibility.years.length > 0 && !company.eligibility.years.map(String).includes(String(user.year))) return false;
  return true;
}
