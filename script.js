const MAX_COLLEGES = 5;

const CATEGORY_COLORS = {
  UR: "#2563eb",
  OBC: "#16a34a",
  SC: "#7c3aed",
  ST: "#dc2626",
  EWS: "#f59e0b",
  PwBD: "#0f766e"
};

let rawData = [];
let selectedProgram = "";
let chart;

const programSearch = document.getElementById("programSearch");
const programDropdown = document.getElementById("programDropdown");
const categorySelect = document.getElementById("categorySelect");
const collegeSearch = document.getElementById("collegeSearch");
const collegeList = document.getElementById("collegeList");
const collegeCount = document.getElementById("collegeCount");
const collegeWarning = document.getElementById("collegeWarning");

fetch("/api/data")
  .then(res => res.json())
  .then(data => rawData = data);

/* ---------- PROGRAM SEARCH ---------- */

programSearch.addEventListener("input", () => {
  const q = programSearch.value.toLowerCase();
  programDropdown.innerHTML = "";

  if (!q) {
    programDropdown.classList.add("hidden");
    return;
  }

  const programs = [...new Set(rawData.map(d => d["PROGRAM NAME"]))];
  const matches = programs.filter(p => p.toLowerCase().includes(q));

  matches.forEach(p => {
    const item = document.createElement("div");
    item.className = "dropdown-item";
    item.textContent = p;
    item.onclick = () => {
      selectedProgram = p;
      programSearch.value = p;
      programDropdown.classList.add("hidden");
      renderColleges();
      updateChart();
    };
    programDropdown.appendChild(item);
  });

  programDropdown.classList.toggle("hidden", matches.length === 0);
});

/* ---------- COLLEGES ---------- */

function renderColleges() {
  collegeList.innerHTML = "";
  collegeCount.textContent = `0 / ${MAX_COLLEGES} selected`;
  collegeWarning.classList.add("hidden");

  if (!selectedProgram) return;

  const colleges = rawData
    .filter(d => d["PROGRAM NAME"] === selectedProgram)
    .map(d => d["COLLEGE NAME"]);

  colleges.forEach(college => {
    const div = document.createElement("div");
    div.className = "college-item";
    div.innerHTML = `
      <input type="checkbox" value="${college}">
      <span>${college}</span>
    `;
    div.querySelector("input").addEventListener("change", handleCollegeSelect);
    collegeList.appendChild(div);
  });
}

collegeSearch.addEventListener("input", () => {
  const q = collegeSearch.value.toLowerCase();
  document.querySelectorAll(".college-item").forEach(item => {
    item.style.display = item.innerText.toLowerCase().includes(q) ? "" : "none";
  });
});

function handleCollegeSelect() {
  const checked = collegeList.querySelectorAll("input:checked");

  if (checked.length > MAX_COLLEGES) {
    this.checked = false;
    collegeWarning.classList.remove("hidden");
    return;
  }

  collegeCount.textContent = `${checked.length} / ${MAX_COLLEGES} selected`;
  updateChart();
}

categorySelect.addEventListener("change", updateChart);

/* ---------- CHART (FINAL MOBILE FIX) ---------- */

function updateChart() {
  if (!selectedProgram) return;

  const category = categorySelect.value;
  const selectedColleges = [...collegeList.querySelectorAll("input:checked")].map(i => i.value);

  let filtered = rawData.filter(d => d["PROGRAM NAME"] === selectedProgram);

  if (selectedColleges.length) {
    filtered = filtered.filter(d => selectedColleges.includes(d["COLLEGE NAME"]));
  } else {
    filtered = filtered
      .filter(d => d[category] !== null)
      .sort((a, b) => b[category] - a[category])
      .slice(0, 5);
  }

  if (chart) chart.destroy();

  chart = new Chart(document.getElementById("cutoffChart"), {
    type: "bar",
    data: {
      labels: filtered.map(d => d["COLLEGE NAME"]),
      datasets: [{
        label: `${category} Cutoff`,
        data: filtered.map(d => d[category]),
        backgroundColor: CATEGORY_COLORS[category],
        borderRadius: 6,
        barThickness: 36,
        maxBarThickness: 40
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: { left: 8, right: 8, bottom: 10 }
      },
      scales: {
        x: {
          offset: true,
          grid: { display: false },
          ticks: {
            autoSkip: false,
            maxRotation: 0,
            padding: 6,
            callback: function (value) {
              const label = filtered[value]["COLLEGE NAME"];
              return label.length > 12 ? label.slice(0, 12) + "…" : label;
            }
          }
        },
        y: {
          beginAtZero: true
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            title: ctx => filtered[ctx[0].dataIndex]["COLLEGE NAME"],
            label: ctx => `Cutoff: ${ctx.raw}`
          }
        },
        legend: {
          display: true
        }
      }
    }
  });
}

