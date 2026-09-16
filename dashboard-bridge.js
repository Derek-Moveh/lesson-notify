document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('ln_user_token');
    const userName = localStorage.getItem('ln_user_name') || 'User';
    const userRole = localStorage.getItem('ln_user_role');

    // 1. Route Security Check: Redirect to login if unauthenticated
    if (!token) {
        window.location.href = 'auth.html?mode=signin';
        return;
    }

    // 2. Update User Welcome Greeting dynamically
    const welcomeHeading = document.querySelector('h2') || document.querySelector('.welcome-text');
    const userDisplayName = document.getElementById('userDisplayName');
    
    if (userDisplayName) {
        userDisplayName.textContent = userName;
    }

    // 3. Setup Sign Out Handler
    const signOutBtn = document.querySelector('button:contains("Sign Out")') || document.getElementById('signOutBtn');
    if (signOutBtn) {
        signOutBtn.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = 'auth.html?mode=signin';
        });
    }

    // 4. Fetch Dynamic Stats & Schedules from Backend
    try {
        const response = await fetch('/api/dashboard/stats', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                localStorage.clear();
                window.location.href = 'auth.html?mode=signin';
                return;
            }
            throw new Error('Failed to load portal metrics');
        }

        const data = await response.json();

        // 5. Update Counter Cards dynamically
        updateStatCard('statInstructors', data.activeInstructors);
        updateStatCard('statStudents', data.enrolledStudents);
        updateStatCard('statSchedules', data.schedulesToday);

        // 6. Populate Schedule Table dynamically
        renderScheduleTable(data.schedules, userRole);

    } catch (error) {
        console.error('❌ Dashboard Bridge Error:', error);
    }
});

function updateStatCard(elementId, value) {
    const el = document.getElementById(elementId);
    if (el && value !== undefined) {
        el.textContent = value;
    }
}

function renderScheduleTable(schedules, role) {
    const tableBody = document.getElementById('scheduleTableBody');
    if (!tableBody) return;

    if (!schedules || schedules.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:20px; color:#64748b;">No active schedules found for today.</td></tr>`;
        return;
    }

    tableBody.innerHTML = schedules.map(item => {
        const instructor = item.users ? item.users.name : (item.instructor_name || 'Unassigned');
        const badgeClass = item.status === 'Dispatched' || item.status === 'Live Now' ? 'badge-success' : 'badge-warning';

        return `
            <tr>
                <td><strong>${item.start_time} - ${item.end_time}</strong></td>
                <td>${item.title}</td>
                ${role === 'admin' ? `<td>${instructor}</td>` : ''}
                <td>${item.venue}</td>
                <td><span class="status-badge ${badgeClass}">${item.status}</span></td>
            </tr>
        `;
    }).join('');
}