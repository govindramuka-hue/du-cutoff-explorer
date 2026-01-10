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
let chart;

fetch("data.json")
  .then(res => res.json())
  .then(data => {
    rawData = data;
    populatePrograms();
  });

const programSelect = document.getElementById("programSelect");
const categorySelect = document.getElementById("categorySelect");
const programSearch = document.getElementById("programSearch");
const collegeSearch = document.getElementById("collegeSearch");
const collegeList = document.getElementById("collegeList");
const collegeCount = document.getElementById("collegeCount");
const collegeWarning = document.getElementById("collegeWarning");

function populatePrograms() {
  const programs = [...new Set(rawData.map(d => d["PROGRAM NAME"]))];
  programSelect.innerHTML = `<option value="">Select program</option>`;
  programs.forEach(p => {
    const opt = document.createElement("option");
    opt.value = p;
    opt.textContent = p;
    programSelect.appendChild(opt);
  });
}

programSearch.addEventListener("input", () => {
  const q = programSearch.value.toLowerCase();
  [...programSelect.options].forEach(o => {
    if (!o.value) return;
    o.hidden = !o.value.toLowerCase().includes(q);
  });
});

programSelect.addEventListener("change", () => {
  renderColleges();
  updateChart();
});

categorySelect.addEventListener("change", updateChart);

function renderColleges() {
  collegeList.innerHTML = "";
  collegeCount.textContent = `0 / ${MAX_COLLEGES} selected`;
  collegeWarning.classList.add("hidden");

  const program = programSelect.value;
  if (!program) return;

  const colleges = rawData
    .filter(d => d["PROGRAM NAME"] === program)
    .map(d => d["COLLEGE NAME"]);

  colleges.forEach(college => {
    const div = document.createElement("div");
    div.className = "college-item";
    div.innerHTML = `<input type="checkbox" value="${college}"><span>${college}</span>`;
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

function updateChart() {
  const program = programSelect.value;
  if (!program) return;

  const category = categorySelect.value;
  const selectedColleges = [...collegeList.querySelectorAll("input:checked")].map(i => i.value);

  let filtered = rawData.filter(d => d["PROGRAM NAME"] === program);

  if (selectedColleges.length > 0) {
    filtered = filtered.filter(d => selectedColleges.includes(d["COLLEGE NAME"]));
  } else {
    filtered = filtered.sort((a, b) => b[category] - a[category]).slice(0, 5);
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
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      plugins: {
        tooltip: {
          callbacks: {
            label: ctx => `Cutoff: ${ctx.raw}`
          }
        }
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}
