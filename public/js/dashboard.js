document.addEventListener("DOMContentLoaded", () => {
  loadAssignments();
  loadWorkStats();
  loadNextClass();
});


async function loadAssignments() {
  const res = await fetch("/api/assignments");
  const assignments = await res.json();

  document.getElementById("assignmentCount").textContent = assignments.length;

  if (assignments.length === 0) {
    document.getElementById("nextDue").textContent = "None";
    return;
  }

  assignments.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  const next = assignments[0];
  const date = new Date(next.dueDate);

  document.getElementById("nextDue").textContent =
    date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}


async function loadWorkStats() {
  const userEmail = localStorage.getItem("userEmail");

  const res = await fetch(`/api/work?userEmail=${userEmail}`);
  const shifts = await res.json();

  let totalHours = 0;
  let totalEarned = 0;

  shifts.forEach(shift => {
    const [sh, sm] = shift.start.split(":").map(Number);
    const [eh, em] = shift.end.split(":").map(Number);

    let start = sh * 60 + sm;
    let end = eh * 60 + em;

    if (end < start) end += 24 * 60;

    const hours = (end - start) / 60;

    totalHours += hours;
    totalEarned += shift.total;
  });

  document.getElementById("totalHours").textContent = totalHours.toFixed(1);
  document.getElementById("totalEarned").textContent = "€" + totalEarned.toFixed(2);
}


async function loadNextClass() {
  const userEmail = localStorage.getItem("userEmail");

  const res = await fetch(`/api/classes?userEmail=${userEmail}`);
  const classes = await res.json();

  if (classes.length === 0) {
    document.getElementById("nextClass").textContent = "No classes";
    return;
  }

  classes.sort((a, b) => a.time.localeCompare(b.time));

  const next = classes[0];

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];

  document.getElementById("nextClass").textContent =
    `${days[next.day - 1]} ${next.time} - ${next.name}`;
}