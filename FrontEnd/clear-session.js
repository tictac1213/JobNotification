// Clear Session Script
// Run this in browser console to clear all session data

console.log('Clearing all session data...');

// Clear localStorage
localStorage.clear();
console.log('localStorage cleared');

// Clear sessionStorage
sessionStorage.clear();
console.log('sessionStorage cleared');

// Clear cookies (if any)
document.cookie.split(";").forEach(function(c) { 
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
});
console.log('cookies cleared');

// Redirect to login
window.location.href = '/login';
console.log('Redirecting to login page...'); 