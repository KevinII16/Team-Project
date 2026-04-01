const assignmentForm = document.getElementById('assignmentForm');
const assignmentList = document.getElementById('assignmentList');
const assignmentTotal = document.getElementById('assignmentTotal');
const assignmentMessage = document.getElementById('assignmentMessage');

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function showMessage(text, isError = false) {
  assignmentMessage.textContent = text;
  assignmentMessage.classList.remove('hidden', 'success-message', 'error-message');
  assignmentMessage.classList.add(isError ? 'error-message' : 'success-message');

  setTimeout(() => {
    assignmentMessage.classList.add('hidden');
  }, 2500);
}

function updateCount(assignments) {
  const count = assignments.length;
  assignmentTotal.textContent = `${count} item${count === 1 ? '' : 's'}`;
}

function createAssignmentItem(assignment) {
  const listItem = document.createElement('li');
  listItem.className = 'assignment-item';
  listItem.innerHTML = `
    <div>
      <h4>${assignment.title}</h4>
      <p>${assignment.module}</p>
      <span class="due-date">Due ${formatDate(assignment.dueDate)}</span>
    </div>
    <button class="delete-btn" data-id="${assignment._id}">Delete</button>
  `;
  return listItem;
}

async function loadAssignments() {
  try {
    const response = await fetch('/api/assignments');
    const assignments = await response.json();

    assignmentList.innerHTML = '';
    updateCount(assignments);

    if (!assignments.length) {
      assignmentList.innerHTML = '<li class="empty-state">No assignments saved yet.</li>';
      return;
    }

    assignments.forEach((assignment) => {
      assignmentList.appendChild(createAssignmentItem(assignment));
    });
  } catch (error) {
    assignmentList.innerHTML = '<li class="empty-state">Could not load assignments.</li>';
    assignmentTotal.textContent = '0 items';
  }
}

assignmentForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const formData = new FormData(assignmentForm);
  const payload = {
    title: formData.get('title').trim(),
    module: formData.get('module').trim(),
    dueDate: formData.get('dueDate'),
  };

  try {
    const response = await fetch('/api/assignments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Could not save assignment');
    }

    assignmentForm.reset();
    showMessage('Assignment added successfully.');
    loadAssignments();
  } catch (error) {
    showMessage('Failed to add assignment.', true);
  }
});

assignmentList.addEventListener('click', async (event) => {
  if (!event.target.classList.contains('delete-btn')) {
    return;
  }

  const assignmentId = event.target.dataset.id;

  try {
    const response = await fetch(`/api/assignments/${assignmentId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Could not delete assignment');
    }

    showMessage('Assignment deleted.');
    loadAssignments();
  } catch (error) {
    showMessage('Failed to delete assignment.', true);
  }
});

loadAssignments();
