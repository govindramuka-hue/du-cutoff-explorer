let rawData = [];
let chart;
const MAX_COLLEGES = 5;

fetch("data.json")
  .then(res => res.json())
  .then(data => {
    rawData = data;
    populatePrograms();
  });

const programSelect = document.getElementById("programSelect");
const categorySelect = document.getElementById("categorySelect");
const collegeList = document.getElementById("collegeList");
const collegeCount = document.getElementById("collegeCount");
const collegeWarning = document.getElementById("collegeWarning");

function populatePrograms() {
  const programs = [...new Set(rawData.map(d => d["PROGRAM NAME"]))];
  programSelect.innerHTML = `<option value="">Select a program</option>`;
  programs.forEach(p => {
    const opt = document.createElement("option");
    opt.value = p;
    opt.textContent = p;
    programSelect.appendChild(opt);
  });
}

programSelect.addEventListener("change", () => {
  renderColleges();
  updateChart();
});

categorySelect.addEventListener("change", updateChart);

function renderColleges() {
  collegeList.innerHTML = "";
  collegeWarning.classList.add("hidden");

  const selectedProgram = programSelect.value;
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
  const selectedColleges = [...collegeList.querySelectorAll("input:checked")]
    .map(i => i.value);

  let filtered = rawData.filter(d => d["PROGRAM NAME"] === program);

  if (selectedColleges.length > 0) {
    filtered = filtered.filter(d => selectedColleges.includes(d["COLLEGE NAME"]));
  } else {
    filtered = filtered
      .sort((a, b) => b[category] - a[category])
      .slice(0, 5);
  }

  const labels = filtered.map(d => d["COLLEGE NAME"]);
  const values = filtered.map(d => d[category]);

  if (chart) chart.destroy();

  chart = new Chart(document.getElementById("cutoffChart"), {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: `${category} Cutoff`,
        data: values,
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
        y: {
          beginAtZero: true
        }
      }
    }
  });
}
