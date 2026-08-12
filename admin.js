
const BASE = "https://fvjerthbdiaeomhjvcdg.supabase.co/rest/v1";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2amVydGhiZGlhZW9taGp2Y2RnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzNjkxNTAsImV4cCI6MjA5Nzk0NTE1MH0._y4A3ipIew0GhsCqlc2Ox6p0lvW7X0nCSWEwfHUxEzE";
const HEADERS = { "apikey": ANON_KEY, "Authorization": "Bearer " + ANON_KEY, "Content-Type": "application/json" };
const RESEND_KEY = "re_Jm8jbeFV_NZC4VkDZN5fuhbxWFJQTgfcn";
const ADMIN_EMAIL = "yashasvieducation@gmail.com";
const ADMIN_PASS = "yashasvi@admin2026";

function togglePass(id, btn) {
  const input = document.getElementById(id);
  if (input.type === 'password') {
    input.type = 'text';
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';
  } else {
    input.type = 'password';
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
  }
}

function adminLogin() {
  const pass = document.getElementById('adminPassword').value;
  if (pass === ADMIN_PASS) {
    document.getElementById('loginWrap').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'grid';
    loadDashboard();
  } else {
    document.getElementById('loginMsg').textContent = 'Incorrect password.';
    document.getElementById('loginMsg').style.display = 'block';
  }
}

document.getElementById('adminPassword').addEventListener('keydown', e => {
  if (e.key === 'Enter') adminLogin();
});

function switchPanel(name) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
  document.getElementById('panel-' + name).classList.add('active');
  document.getElementById('tab-' + name).classList.add('active');
  if (name === 'students') loadStudents();
  if (name === 'courses') loadCourses();
  if (name === 'requests') loadRequests();
  if (name === 'payments') loadPayments();
  if (name === 'institutions') loadInstitutions();
}

// Dashboard
function statusBadge(status) {
  if (status === 'certified' || status === 'admitted' || status === 'fee_paid') return 'badge-green';
  if (status === 'form_submitted' || status === 'exam_completed' || status === 'quarterly_passed') return 'badge-yellow';
  return 'badge-yellow';
}

async function loadDashboard() {
  try {
    const [sRes, cRes, rRes] = await Promise.all([
      fetch(BASE + "/students?select=id,student_name,student_email,selected_course,admission_status,country,created_at&order=created_at.desc&limit=10", { headers: HEADERS }),
      fetch(BASE + "/courses?select=id&is_active=eq.true", { headers: HEADERS }),
      fetch(BASE + "/course_requests?select=id", { headers: HEADERS })
    ]);
    const students = await sRes.json();
    const courses = await cRes.json();
    const requests = await rRes.json();
    const admitted = students.filter(s => s.admission_status === 'admitted' || s.admission_status === 'certified').length;

    document.getElementById('stat-students').textContent = students.length;
    document.getElementById('stat-admitted').textContent = admitted;
    document.getElementById('stat-courses').textContent = Array.isArray(courses) ? courses.length : 0;
    document.getElementById('stat-requests').textContent = Array.isArray(requests) ? requests.length : 0;

    if (Array.isArray(requests) && requests.length > 0) {
      document.getElementById('requestBadge').textContent = requests.length + ' new requests';
      document.getElementById('requestBadge').style.display = 'block';
    }

    if (Array.isArray(students)) {
      document.getElementById('recentStudents').innerHTML = students.map(s => `
        <tr>
          <td>${s.student_name || '—'}</td>
          <td style="font-size:12px; color:#5f6368;">${s.student_email}</td>
          <td>${s.selected_course || '—'}</td>
          <td><span class="badge ${statusBadge(s.admission_status)}">${s.admission_status || 'pending'}</span></td>
          <td>${s.country || '—'}</td>
          <td style="font-size:12px; color:#5f6368;">${s.created_at ? new Date(s.created_at).toLocaleDateString('en-IN') : '—'}</td>
        </tr>`).join('');
    }
  } catch (e) { console.error(e); }
}

// Students
async function loadStudents() {
  try {
    const res = await fetch(BASE + "/students?select=*&order=created_at.desc", { headers: HEADERS });
    const data = await res.json();
    if (!Array.isArray(data)) return;
    document.getElementById('allStudents').innerHTML = data.map(s => `
      <tr>
        <td>${s.student_name || '—'}</td>
        <td style="font-size:12px;">${s.student_email}</td>
        <td style="font-size:12px;">${s.selected_course || 'Not selected'}</td>
        <td><span class="badge badge-blue">${s.exam_difficulty || 'normal'}</span></td>
        <td>${s.exam_score ? s.exam_score + '%' : '—'}</td>
        <td><span class="badge ${statusBadge(s.admission_status)}">${s.admission_status || 'pending'}</span></td>
        <td><span class="badge ${s.fee_paid ? 'badge-green' : 'badge-grey'}">${s.fee_paid ? 'Paid' : 'Unpaid'}</span></td>
      </tr>`).join('');
  } catch (e) { console.error(e); }
}

// Courses
async function loadCourses() {
  try {
    const res = await fetch(BASE + "/courses?select=*&order=created_at.desc", { headers: HEADERS });
    const data = await res.json();
    if (!Array.isArray(data)) return;
    document.getElementById('coursesList').innerHTML = data.map(c => `
      <tr>
        <td><strong>${c.name}</strong><br><span style="font-size:12px; color:#5f6368;">${c.description ? c.description.substring(0,60) + '…' : ''}</span></td>
        <td>${c.department || '—'}</td>
        <td><span class="badge badge-blue">${c.level || 'beginner'}</span></td>
        <td>${c.is_free ? '<span class="badge badge-green">Free</span>' : '$' + c.fee_usdt + ' USDT'}</td>
        <td><span class="badge ${c.is_active ? 'badge-green' : 'badge-grey'}">${c.is_active ? 'Active' : 'Inactive'}</span></td>
        <td>
          <button class="btn btn-outline btn-sm" onclick="toggleCourse('${c.id}', ${!c.is_active})">${c.is_active ? 'Deactivate' : 'Activate'}</button>
        </td>
      </tr>`).join('');
  } catch (e) { console.error(e); }
}

async function addCourse() {
  const name = document.getElementById('courseName').value.trim();
  if (!name) { showToast('Please enter a course name.'); return; }
  const tags = document.getElementById('courseTags').value.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
  const btn = event.target;
  btn.disabled = true; btn.textContent = 'Adding...';
  try {
    const res = await fetch(BASE + "/courses", {
      method: "POST",
      headers: { ...HEADERS, "Prefer": "return=representation" },
      body: JSON.stringify({
        name,
        description: document.getElementById('courseDesc').value.trim(),
        department: document.getElementById('courseDept').value,
        level: document.getElementById('courseLevel').value,
        duration_weeks: parseInt(document.getElementById('courseDuration').value),
        fee_usdt: parseFloat(document.getElementById('courseFee').value),
        is_free: document.getElementById('courseIsFree').checked,
        tags,
        is_active: false
      })
    });
    const data = await res.json();
    const courseId = Array.isArray(data) ? data[0]?.id : null;

    if (courseId) {
      showToast('✅ Course added! AI generating content...');
      btn.textContent = 'Generating content...';

      // Auto-generate content
      const genRes = await fetch('https://fvjerthbdiaeomhjvcdg.supabase.co/functions/v1/generate-course-content', {
        method: 'POST',
        headers: { 'apikey': ANON_KEY, 'Authorization': 'Bearer ' + ANON_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course_id: courseId,
          course_name: name,
          department: document.getElementById('courseDept').value,
          level: document.getElementById('courseLevel').value,
          description: document.getElementById('courseDesc').value.trim()
        })
      });
      const genData = await genRes.json();
      if (genData.success) {
        showToast('🎉 Course live! ' + genData.modules_count + ' modules generated by AI.');
      } else {
        showToast('Course added but content generation failed. Try again.');
      }
    }

    loadCourses();
    ['courseName','courseDesc','courseTags'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('courseIsFree').checked = false;
  } catch (e) { showToast('Error: ' + e.message); }
  btn.disabled = false; btn.textContent = 'Add Course';
}

async function toggleCourse(id, active) {
  await fetch(BASE + "/courses?id=eq." + id, {
    method: "PATCH", headers: { ...HEADERS, "Prefer": "return=representation" },
    body: JSON.stringify({ is_active: active })
  });
  loadCourses();
}

// Monitoring
async function loadMonitoring() {
  try {
    // Load error logs
    const errRes = await fetch(BASE + "/error_logs?select=*&order=created_at.desc&limit=50", { method: "GET", headers: HEADERS });
    const errors = await errRes.json();
    
    // Today's errors
    const today = new Date().toISOString().split('T')[0];
    const todayErrors = errors.filter(e => e.created_at && e.created_at.startsWith(today));
    const stuckErrors = errors.filter(e => e.error_type === 'access_blocked');
    
    document.getElementById('mon-errors').textContent = todayErrors.length;
    document.getElementById('mon-stuck').textContent = stuckErrors.length;

    // Active students today
    const actRes = await fetch(BASE + "/syllabus_progress?select=student_email&last_active=gte." + today + "T00:00:00", { method: "GET", headers: HEADERS });
    const active = await actRes.json();
    document.getElementById('mon-active').textContent = Array.isArray(active) ? active.length : 0;
    
    // Error logs table
    if (!Array.isArray(errors) || errors.length === 0) {
      document.getElementById('errorLogsTable').innerHTML = '<div style="padding:24px;text-align:center;color:#5f6368;">No errors logged. Platform running smoothly!</div>';
      return;
    }
    
    const rows = errors.map(e => `
      <tr style="border-bottom:1px solid #f1f3f4;">
        <td style="padding:10px 14px;font-size:13px;color:${e.error_type==='access_blocked'?'#b06000':'#c5221f'}">${e.error_type||'unknown'}</td>
        <td style="padding:10px 14px;font-size:13px;color:#5f6368">${e.student_email||'—'}</td>
        <td style="padding:10px 14px;font-size:12px;color:#5f6368;max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${e.error_message||'—'}</td>
        <td style="padding:10px 14px;font-size:12px;color:#80868b">${e.created_at ? new Date(e.created_at).toLocaleString('en-IN') : '—'}</td>
      </tr>`).join('');
    
    document.getElementById('errorLogsTable').innerHTML = `
      <table style="width:100%;border-collapse:collapse;">
        <thead><tr style="background:#f8f9fa;border-bottom:1px solid #e8eaed;">
          <th style="padding:10px 14px;font-size:12px;font-weight:500;color:#5f6368;text-align:left;">Error Type</th>
          <th style="padding:10px 14px;font-size:12px;font-weight:500;color:#5f6368;text-align:left;">Student</th>
          <th style="padding:10px 14px;font-size:12px;font-weight:500;color:#5f6368;text-align:left;">Message</th>
          <th style="padding:10px 14px;font-size:12px;font-weight:500;color:#5f6368;text-align:left;">Time</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>`;
  } catch(e) {
    document.getElementById('errorLogsTable').innerHTML = '<div style="padding:16px;color:#c5221f;">Error loading logs: ' + e.message + '</div>';
  }
}

async function sendBulkNotification() {
  const course = document.getElementById('notifCourse').value.trim();
  const msg = document.getElementById('notifMsg').value.trim();
  if (!course || !msg) { alert('Please fill course name and message.'); return; }
  
  const btn = event.target;
  btn.disabled = true; btn.textContent = 'Sending...';
  
  try {
    // Get all students
    const res = await fetch(BASE + "/students?select=student_email,student_name&admission_status=in.(admitted,certified,fee_paid,final_exam_passed)", { method: "GET", headers: HEADERS });
    const students = await res.json();
    
    if (!Array.isArray(students) || students.length === 0) {
      document.getElementById('notifResult').textContent = 'No students found.';
      document.getElementById('notifResult').style.display = 'block';
      btn.disabled = false; btn.textContent = 'Send to All Students';
      return;
    }
    
    // Insert notifications for all students
    const notifications = students.map(s => ({
      student_email: s.student_email,
      title: 'New Course: ' + course,
      message: msg,
      type: 'new_course',
      is_read: false
    }));
    
    await fetch(BASE + "/notifications", {
      method: "POST",
      headers: { ...HEADERS, "Prefer": "return=representation" },
      body: JSON.stringify(notifications)
    });
    
    // Send email to admin
    await fetch("https://fvjerthbdiaeomhjvcdg.supabase.co/functions/v1/send-verification-email", {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({
        type: 'course_request',
        to: 'yashasvieducation@gmail.com',
        studentName: 'Admin',
        requestedCourse: 'Bulk notification sent for: ' + course + ' to ' + students.length + ' students'
      })
    });
    
    const result = document.getElementById('notifResult');
    result.style.color = '#137333';
    result.textContent = 'Notification sent to ' + students.length + ' students!';
    result.style.display = 'block';
    document.getElementById('notifCourse').value = '';
    document.getElementById('notifMsg').value = '';
  } catch(e) {
    document.getElementById('notifResult').style.color = '#c5221f';
    document.getElementById('notifResult').textContent = 'Error: ' + e.message;
    document.getElementById('notifResult').style.display = 'block';
  }
  btn.disabled = false; btn.textContent = 'Send to All Students';
}

// Course Requests
async function loadRequests() {
  try {
    const res = await fetch(BASE + "/course_requests?select=*&order=created_at.desc", { headers: HEADERS });
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      document.getElementById('requestsList').innerHTML = '<p style="color:#5f6368;">No course requests yet.</p>';
      return;
    }
    document.getElementById('requestsList').innerHTML = data.map(r => {
      var status = r.status || (r.notified_admin ? 'found' : 'pending');
      var statusLabel = status === 'found' ? 'Fulfilled' : status === 'denied' ? 'Denied' : 'Pending';
      var statusColor = status === 'found' ? '#137333' : status === 'denied' ? '#c5221f' : '#b06000';
      var statusBg = status === 'found' ? '#e6f4ea' : status === 'denied' ? '#fce8e6' : '#fef7e0';
      var reqText = (r.requested_course || '').substring(0, 80);
      var date = r.created_at ? new Date(r.created_at).toLocaleDateString('en-IN') : '';
      return '<div class="request-card">' +
        '<div class="request-info">' +
          '<div class="r-course">' + reqText + '</div>' +
          '<div class="r-meta">From: ' + (r.student_name || 'Unknown') + ' (' + r.student_email + ') &middot; ' + date + '</div>' +
        '</div>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">' +
          '<span style="font-size:11px;font-weight:500;border-radius:100px;padding:3px 10px;background:' + statusBg + ';color:' + statusColor + ';">' + statusLabel + '</span>' +
          (status !== 'found' && status !== 'denied' ? '<button class="btn btn-success btn-sm" onclick="doLaunch(' + JSON.stringify(r.id) + ',' + JSON.stringify(r.student_email) + ')" >Launch Course</button>' : '') +
        '</div>' +
      '</div>';
    }).join('');
  } catch (e) { console.error(e); }
}

async function rejectRequest(requestId, studentEmail) {
  if (!confirm("Reject this request and notify the student?")) return;
  try {
    await fetch(BASE + "/course_requests?id=eq." + requestId, {
      method: "PATCH", headers: HEADERS,
      body: JSON.stringify({ status: "denied", notified_admin: true })
    });
    await fetch(BASE + "/notifications", {
      method: "POST", headers: HEADERS,
      body: JSON.stringify({
        student_email: studentEmail,
        title: "Course Request Update",
        message: "We are sorry, we could not build your requested course at this time. Please try a different request!",
        type: "new_course",
        is_read: false
      })
    });
    showToast("Request rejected. Student notified.");
    loadRequests();
  } catch(e) { showToast("Error rejecting request"); }
}

async function deleteRequest(requestId) {
  if (!confirm("Delete this request permanently?")) return;
  try {
    await fetch(BASE + "/course_requests?id=eq." + requestId, {
      method: "DELETE", headers: HEADERS
    });
    var el = document.getElementById("req-" + requestId);
    if (el) el.remove();
    showToast("Request deleted.");
    loadRequests();
  } catch(e) { showToast("Error deleting request"); }
}

async function autoRejectExpired() {
  // Auto-reject requests older than 24hrs that are still pending
  try {
    var cutoff = new Date(Date.now() - 24*60*60*1000).toISOString();
    var res = await fetch(BASE + "/course_requests?select=id,student_email&status=eq.pending&created_at=lt." + cutoff, { method: "GET", headers: HEADERS });
    var data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return;
    for (var i = 0; i < data.length; i++) {
      var r = data[i];
      await fetch(BASE + "/course_requests?id=eq." + r.id, {
        method: "PATCH", headers: HEADERS,
        body: JSON.stringify({ status: "denied" })
      });
      await fetch(BASE + "/notifications", {
        method: "POST", headers: HEADERS,
        body: JSON.stringify({
          student_email: r.student_email,
          title: "Course Request Expired",
          message: "Your course request could not be fulfilled within 24 hours. Please submit a new request!",
          type: "new_course",
          is_read: false
        })
      });
    }
    if (data.length > 0) { showToast(data.length + " expired requests auto-rejected."); loadRequests(); }
  } catch(e) {}
}

async function doLaunch(requestId, studentEmail) {
  var res = await fetch(BASE + "/course_requests?select=requested_course&id=eq." + requestId, { method: "GET", headers: HEADERS });
  var data = await res.json();
  var courseName = Array.isArray(data) && data[0] ? data[0].requested_course : "New Course";
  await launchFromRequest(courseName, studentEmail, requestId);
}

async function launchFromRequest(courseName, studentEmail, requestId) {
  var shortName = (courseName || "").replace(/\[[\s\S]*?\]\s*/g, "").substring(0, 60).trim();
  if (!shortName) shortName = "New Course";

  // Check if course already exists
  var checkRes = await fetch(BASE + "/courses?select=id&name=ilike." + encodeURIComponent(shortName) + "&is_active=eq.true", { method: "GET", headers: HEADERS });
  var existing = await checkRes.json();
  var courseExists = Array.isArray(existing) && existing.length > 0;

  // Add course if not exists
  if (!courseExists) {
    await fetch(BASE + "/courses", {
      method: "POST",
      headers: Object.assign({}, HEADERS, {"Prefer": "return=representation"}),
      body: JSON.stringify({
        name: shortName,
        department: "Technology",
        level: "Any",
        difficulty: "Beginner",
        duration_hours: 36,
        duration_months: 3,
        is_free: false,
        is_active: true,
        program_type: "course",
        price_usdt: 99,
        description: "Student requested course: " + shortName,
        tags: ["student-requested"]
      })
    });
  }

  // Mark request as fulfilled — unlocks student form
  await fetch(BASE + "/course_requests?id=eq." + requestId, {
    method: "PATCH",
    headers: HEADERS,
    body: JSON.stringify({ notified_admin: true, status: "found" })
  });

  // Notify student with course name in message
  await fetch(BASE + "/notifications", {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({
      student_email: studentEmail,
      title: "Your requested course is now live!",
      message: "Great news! '" + shortName + "' has been added to our platform. Go to My Courses, enroll and start learning now!",
      type: "new_course",
      is_read: false
    })
  });

  showToast("Course launched! Student notified.");
  loadRequests();
}
