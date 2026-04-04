document.addEventListener("DOMContentLoaded", () => {

  // LOAD ASSIGNMENTS
  async function loadAssignments() {
    try {
      const res = await fetch("/api/assignments");
      const assignments = await res.json();

      // count
      document.getElementById("assignmentCount").textContent = assignments.length;

      // next due
      if (assignments.length > 0) {
        const next = assignments[0];

        const date = new Date(next.dueDate);
        const formatted = date.toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short"
        });

        document.getElementById("nextDue").textContent = formatted;
      }

    } catch (err) {
      console.error("Error loading assignments:", err);
    }
  }

  // LOAD WORK STATS
  async function loadWorkStats() {
    try {
      const res = await fetch("/api/work");
      const shifts = await res.json();

      let totalMoney = 0;
      let totalHours = 0;

      shifts.forEach(shift => {
        // money
        totalMoney += shift.total || 0;

        // hours from start/end
        if (shift.start && shift.end) {
          const [sh, sm] = shift.start.split(":").map(Number);
          const [eh, em] = shift.end.split(":").map(Number);

          let startMin = sh * 60 + sm;
          let endMin = eh * 60 + em;

          if (endMin < startMin) {
            endMin += 24 * 60; // overnight
          }

          totalHours += (endMin - startMin) / 60;
        }
      });

      document.getElementById("totalHours").textContent = totalHours.toFixed(1);
      document.getElementById("totalMoney").textContent = "€" + totalMoney.toFixed(2);

    } catch (err) {
      console.error("Error loading work stats:", err);
    }
  }

  loadAssignments();
  loadWorkStats();

});