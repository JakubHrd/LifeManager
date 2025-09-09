export async function logout() {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
  } catch (err) {
    console.error('Logout request failed', err);
  }

  // vyčisti FE session
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');

  // redirect na login
  window.location.href = '/';
}
