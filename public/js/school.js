document.addEventListener("DOMContentLoaded", () => {

  const timetable = document.getElementById("timetable");
  const form = document.getElementById("classForm");

  const userEmail = localStorage.getItem("userEmail");

  let classes = [];
  let currentWeek = 1;

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];

  // LOAD CLASSES
  async function loadClasses() {
    const res = await fetch(`/api/classes?userEmail=${userEmail}`);
    classes = await res.json();
    renderTable();
  }

  // RENDER TABLE
  function renderTable() {
    timetable.innerHTML = "";

    // headers
    timetable.innerHTML += `<div class="cell header-cell">Time</div>`;
    days.forEach(day => {
      timetable.innerHTML += `<div class="cell header-cell">${day}</div>`;
    });

    // get times for current week
    const times = [...new Set(
      classes
        .filter(c => c.week == currentWeek)
        .map(c => c.time)
    )].sort();

    if (times.length === 0) {
      timetable.innerHTML += `
        <div class="cell empty-state" style="grid-column: span 6;">
          No classes yet. Add your first class →
        </div>
      `;
      return;
    }

    // rows
    times.forEach(time => {
      timetable.innerHTML += `<div class="cell">${time}</div>`;

      days.forEach((_, index) => {
        const found = classes.find(c =>
          c.week == currentWeek &&
          c.day == (index + 1) &&
          c.time === time
        );

        timetable.innerHTML += `
          <div class="cell">
            ${found ? `
              ${found.name}<br>
              <button onclick="deleteClass('${found._id}')">Delete</button>
            ` : ""}
          </div>
        `;
      });
    });
  }

  // ADD CLASS
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("className").value;
    const day = Number(document.getElementById("classDay").value);
    const time = document.getElementById("classTime").value;
    const week = Number(document.getElementById("classWeek").value);

    await fetch("/api/classes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name, day, time, week, userEmail })
    });

    loadClasses();
    form.reset();
  });

  // WEEK SWITCH
  document.querySelectorAll(".week-btn").forEach((btn, index) => {
    btn.addEventListener("click", () => {
      currentWeek = index + 1;

      document.querySelectorAll(".week-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      renderTable();
    });
  });

  loadClasses();

});

// DELETE CLASS
async function deleteClass(id) {
  await fetch(`/api/classes/${id}`, {
    method: "DELETE"
  });

  location.reload();
}