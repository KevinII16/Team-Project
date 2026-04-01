const assignmentCount = document.getElementById('assignmentCount');
const nextDue = document.getElementById('nextDue');
const upcomingAssignments = document.getElementById('upcomingAssignments');

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IE', {
    day: 'numeric',
    month: 'short',
  });
}

async function loadDashboardData() {
  try {
    const response = await fetch('/api/assignments');
    const assignments = await response.json();

    assignmentCount.textContent = assignments.length;

    if (!assignments.length) {
      nextDue.textContent = 'No data';
      upcomingAssignments.innerHTML = '<p class="muted-text">No assignments added yet.</p>';
      return;
    }

    nextDue.textContent = formatDate(assignments[0].dueDate);

    const upcomingHtml = assignments
      .slice(0, 3)
      .map(
        (assignment) => `
          <div class="upcoming-item">
            <div>
              <strong>${assignment.title}</strong>
              <p>${assignment.module}</p>
            </div>
            <span class="badge">${formatDate(assignment.dueDate)}</span>
          </div>
        `
      )
      .join('');

    upcomingAssignments.innerHTML = upcomingHtml;
  } catch (error) {
    assignmentCount.textContent = '0';
    nextDue.textContent = 'Error';
    upcomingAssignments.innerHTML = '<p class="muted-text">Could not load dashboard data.</p>';
  }
}

loadDashboardData();
