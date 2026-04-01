const timetable = document.getElementById("timetable");
const form = document.getElementById("classForm");

let classes = [];
let currentWeek = 1;

const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];


async function loadClasses() {
  try {
    const res = await fetch("/api/events?category=School");
    const data = await res.json();

    classes = data.map(c => ({
      name: c.Title,
      day: Number(c.Day),
      time: c.Time,
      week: c.week || 1
    }));

    renderTable();

  } catch (err) {
    console.error("Failed to load classes", err);
  }
}


function renderTable() {
  timetable.innerHTML = "";


  timetable.innerHTML += `<div class="cell header-cell">Time</div>`;
  days.forEach(day => {
    timetable.innerHTML += `<div class="cell header-cell">${day}</div>`;
  });


  const times = [...new Set(
    classes
      .filter(c => c.week == currentWeek)
      .map(c => c.time)
  )].sort();

  // Empty state
  if (times.length === 0) {
    timetable.innerHTML += `
      <div class="cell" style="grid-column: span 6; text-align:center;">
        No classes yet
      </div>
    `;
    return;
  }

 
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
          ${found ? found.name : ""}
        </div>
      `;
    });
  });
}


form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("className").value;
  const day = document.getElementById("classDay").value;
  const time = document.getElementById("classTime").value;

  try {
    const res = await fetch("/api/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        Title: name,
        Day: day,
        Time: time,
        Category: "School",
        week: currentWeek
      })
    });

    const newClass = await res.json();

    classes.push({
      name: newClass.Title,
      day: Number(newClass.Day),
      time: newClass.Time,
      week: newClass.week || currentWeek
    });

    renderTable();
    form.reset();

  } catch (err) {
    console.error("Error saving class", err);
  }
});

// 📅 WEEK switching
document.querySelectorAll(".week-btn").forEach((btn, index) => {
  btn.addEventListener("click", () => {
    currentWeek = index + 1;

    document.querySelectorAll(".week-btn").forEach(b =>
      b.classList.remove("active")
    );

    btn.classList.add("active");

    renderTable();
  });
});


loadClasses();