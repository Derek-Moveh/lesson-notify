// Shared helper: attaches the logged-in user's token to every API call.
// Use this instead of the plain fetch() for any request to /api/*.
async function authFetch(url, options = {}) {
    const token = localStorage.getItem('ln_user_token');
    const headers = Object.assign({}, options.headers || {}, {
        'Authorization': token ? `Bearer ${token}` : ''
    });

    const response = await fetch(url, Object.assign({}, options, { headers }));

    // Session missing/expired — send the user back to login rather than
    // letting the page fail silently or show empty/broken data.
    if (response.status === 401) {
        localStorage.removeItem('ln_user_token');
        localStorage.removeItem('ln_user_role');
        localStorage.removeItem('ln_user_name');
        localStorage.removeItem('ln_user_school_id');
        window.location.href = '/login';
        throw new Error('Session expired. Redirecting to login.');
    }

    return response;
}

// Simple guard to put at the top of any protected page's script.
// Redirects to /login immediately if there's no token, and (optionally)
// enforces a specific role server-side-verified at token issue time.
function requireLogin(requiredRole) {
    const token = localStorage.getItem('ln_user_token');
    const role = localStorage.getItem('ln_user_role');

    if (!token) {
        window.location.href = '/login';
        return false;
    }
    if (requiredRole && role !== requiredRole) {
        alert('🔴 Access Denied: You do not have permission to view this page.');
        window.location.href = role === 'teacher' ? '/teacher-dashboard' : '/login';
        return false;
    }
    return true;
}