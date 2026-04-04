document.addEventListener("DOMContentLoaded", () => {

  const table = document.getElementById("workTable");
  const form = document.getElementById("workForm");

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const userEmail = localStorage.getItem("userEmail");

  let shifts = [];

  function calculateHours(start, end) {
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);

    let startMin = sh * 60 + sm;
    let endMin = eh * 60 + em;

    if (endMin < startMin) endMin += 24 * 60;

    return (endMin - startMin) / 60;
  }

  async function loadShifts() {
    const res = await fetch(`/api/work?userEmail=${userEmail}`);
    shifts = await res.json();
    renderTable();
  }

  function renderTable() {
    table.innerHTML = "";

    days.forEach(day => {
      table.innerHTML += `<div class="cell header-cell">${day}</div>`;
    });

    days.forEach((_, index) => {
      const shift = shifts.find(s => s.day == (index + 1));

      if (shift) {
        table.innerHTML += `
          <div class="cell">
            <div class="shift-block">
              ${shift.start} - ${shift.end}<br>
              €${shift.total.toFixed(2)}<br>
              <button onclick="deleteShift('${shift._id}')">Delete</button>
            </div>
          </div>
        `;
      } else {
        table.innerHTML += `<div class="cell"></div>`;
      }
    });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const day = Number(document.getElementById("workDay").value);
    const start = document.getElementById("startTime").value;
    const end = document.getElementById("endTime").value;
    const rate = Number(document.getElementById("workRate").value);

    const hours = calculateHours(start, end);
    const total = hours * rate;

    await fetch("/api/work", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ day, start, end, rate, total, userEmail })
    });

    loadShifts();
    form.reset();
  });

  loadShifts();

});

async function deleteShift(id) {
  await fetch(`/api/work/${id}`, { method: "DELETE" });
  location.reload();
}