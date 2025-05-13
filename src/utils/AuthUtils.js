export const isAuthenticated = () => {
  return localStorage.getItem('isLoggedIn') === 'true';
};

export const getUserRole = () => {
  return localStorage.getItem('userRole');
};

export const clearAuth = () => {
  localStorage.clear();
};

export const canAccessHireFeatures = () => {
  const role = getUserRole();
  return !role || role === 'client';
};

export const canAccessFreelanceFeatures = () => {
  const role = getUserRole();
  return !role || role === 'freelancer';
};
