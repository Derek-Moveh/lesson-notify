document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('ln_user_token');
    const teacherSelect = document.getElementById('scheduleTeacher');

    // Load available instructors into the dropdown menu
    if (teacherSelect && token) {
        try {
            const res = await fetch('/api/teachers', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const teachers = await res.json();

            teacherSelect.innerHTML = `<option value="">Select Faculty Instructor</option>` +
                teachers.map(t => `<option value="${t.id}">${t.name} (${t.phone || 'No Phone'})</option>`).join('');
        } catch (err) {
            console.error('Failed to load teachers for form select:', err);
        }
    }

    // Handle Schedule Form Submission
    const scheduleForm = document.getElementById('addScheduleForm');
    if (scheduleForm) {
        scheduleForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const payload = {
                title: document.getElementById('scheduleTitle').value,
                teacher_id: document.getElementById('scheduleTeacher').value,
                venue: document.getElementById('scheduleVenue').value,
                day_of_week: document.getElementById('scheduleDay').value,
                start_time: document.getElementById('scheduleStartTime').value,
                end_time: document.getElementById('scheduleEndTime').value
            };

            try {
                const res = await fetch('/api/timetables', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                });

                const data = await res.json();

                if (!res.ok) throw new Error(data.error);

                alert('✅ Schedule dispatched and SMS alert triggered!');
                window.location.reload();

            } catch (err) {
                alert(`⚠️ Error: ${err.message}`);
            }
        });
    }
});