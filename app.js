
const state = {
  geoLevel: "state",
  metric: "r",
  decade: "1",
  race: "tt",
  sex: "t",
  age: "100"
};


const raceOptions = {
  "1": [
    { code: "tt", label: "Total (All Races)" },
    { code: "it", label: "American Indian/Alaskan Native" },
    { code: "an", label: "non-Hispanic Asian/Pacific Islander" },
    { code: "bn", label: "non-Hispanic Black" },
    { code: "wn", label: "non-Hispanic White" }
  ],
  "0": [
    { code: "tt", label: "Total (All Races)" },
    { code: "th", label: "Hispanic" },
    { code: "bn", label: "non-Hispanic Black" },
    { code: "wn", label: "non-Hispanic White" },
    { code: "on", label: "Other non-Hispanic" }
  ]
};

const ageValues = [100, 0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75];

// DOM REFERENCES
const controls = {
  levelButtons: [...document.querySelectorAll(".btn[data-level]")],
  metricButtons: [...document.querySelectorAll(".btn[data-metric]")],
  decadeButtons: [...document.querySelectorAll(".btn[data-decade]")],
  raceSelect: document.querySelector("#race"),
  sexSelect: document.querySelector("#sex"),
  ageSelect: document.querySelector("#age")
};

const svg = d3.select("#map");
const mapGroup = svg.append("g").attr("class", "map-layer");
const tooltip = d3.select("#tooltip");
const legend = d3.select("#legend");

// MAP + ZOOM
const projection = d3.geoAlbersUsa().scale(1000).translate([480, 300]);
const path = d3.geoPath().projection(projection);

// AI: details in citations under "zoom"
const zoom = d3.zoom()
  .scaleExtent([1, 8])
  .on("zoom", ({ transform }) => mapGroup.attr("transform", transform));

svg.call(zoom);

document.querySelectorAll(".zoom-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const factor = btn.dataset.zoom === "in" ? 1.25 : 0.8;
    svg.transition().duration(200).call(zoom.scaleBy, factor);
  });
});

// DROPDOWN POPULATORS
// AI: details in citations under "population"
function populateAgeDropdown() {
  controls.ageSelect.innerHTML = ageValues
    .map(v => {
      const text = v === 100
        ? "Total (All Ages)"
        : `${String(v).padStart(2, "0")}-${String(v + 4).padStart(2, "0")}`;
      return `<option value="${v}">${text}</option>`;
    })
    .join("");

  controls.ageSelect.value = state.age;
}

function populateRaceDropdown(decade) {
  const list = raceOptions[decade];
  controls.raceSelect.innerHTML = list
    .map(opt => `<option value="${opt.code}">${opt.label}</option>`)
    .join("");

  if (!list.some(opt => opt.code === state.race)) {
    state.race = list[0].code;
  }
  controls.raceSelect.value = state.race;
}

// TEXT HELPERS
const metricLabel = m =>
  m === "r" ? "Migration Rate per 100" : "Total Migration";

const metricDescriptor = m =>
  m === "r" ? "Net Migration Rate (per 100 residents)" : "Net Migration (absolute count)";

// AI: details in citations under "Text Helpers"

const buildColumnKey = () =>
  `${state.metric}${state.decade}${state.race}${state.sex}${state.age}`;


// LEGEND
function renderLegend(minVal, maxVal, descriptor) {
  const safeMin = Number.isFinite(minVal) ? minVal : 0;
  const safeMax = Number.isFinite(maxVal) ? maxVal : 0;
  const mid = (safeMin + safeMax) / 2;

  legend.selectAll("canvas, .legend-labels").remove();

  const scale = d3.scaleLinear()
    .domain([safeMin, mid, safeMax])
    .range(["#a50026", "#ffffbf", "#006837"]);

  const width = 280;
  const height = 20;

  const canvas = legend.append("canvas")
    .attr("width", width)
    .attr("height", height)
    .node();

  const ctx = canvas.getContext("2d");

  for (let i = 0; i < width; i++) {
    ctx.fillStyle = scale(safeMin + (safeMax - safeMin) * (i / (width - 1)));
    ctx.fillRect(i, 0, 1, height);
  }

  legend.append("div")
    .attr("class", "legend-labels")
    .style("width", `${width}px`)
    .html(`
      <span>${safeMin.toLocaleString()}</span>
      <span>${safeMax.toLocaleString()}</span>
    `);

  d3.select("#legend-metric").text(descriptor);
}

// COLOR SCALE
const createColorScale = values => {
  const minVal = d3.min(values);
  const maxVal = d3.max(values);

// AI: details in citations under "Color Scale'
  const safeMin = Number.isFinite(minVal) ? minVal : 0;
  const safeMax = Number.isFinite(maxVal) ? maxVal : 0;

  return {
    scale: d3.scaleDiverging()
      .domain([safeMin, 0, safeMax])
      .interpolator(d3.interpolateRdYlGn),
    minVal,
    maxVal
  };
};

// MAP RENDERING
function renderMap(geoData, dataByFips) {
  const column = buildColumnKey();
  const descriptor = metricDescriptor(state.metric);
  const tooltipLabel = metricLabel(state.metric);

  const values = geoData.rows
    .map(row => +row[column])
    .filter(v => !Number.isNaN(v));

  const { scale, minVal, maxVal } = createColorScale(values);
  renderLegend(minVal, maxVal, descriptor);

  mapGroup.selectAll("path")
    .data(geoData.features, d => d.id)
    .join("path")
    .attr("d", path)
    .attr("class", "state")
    .attr("fill", d => {
      // AI citation under 'Map Rendering' 
      const fips = String(d.id).padStart(5, "0");
      const value = dataByFips.get(fips)?.[column];
      return value ? scale(+value) : "#e2e8f0";
    })
    .on("pointermove", (event, d) => {
      const fips = String(d.id).padStart(5, "0");
      const value = dataByFips.get(fips)?.[column];

      tooltip
        .style("opacity", 1)
        .style("left", `${event.pageX + 15}px`)
        .style("top", `${event.pageY + 15}px`)
        .html(`
          <div style="margin-bottom:4px"><b>${d.properties.name ?? "County"}</b></div>
          <div><b>${tooltipLabel}:</b> ${value ? (+value).toLocaleString() : "No data"}</div>
        `);
    })
    .on("pointerout", () => tooltip.style("opacity", 0));
}


// CONTROL BINDINGS
function updateButtons(buttons, key, active) {
  buttons.forEach(btn =>
    btn.classList.toggle("active", btn.dataset[key] === active)
  );
}

function bindControls(onChange) {
  controls.levelButtons.forEach(btn =>
    btn.addEventListener("click", () => {
      state.geoLevel = btn.dataset.level;
      updateButtons(controls.levelButtons, "level", state.geoLevel);
      onChange();
    })
  );

  controls.metricButtons.forEach(btn =>
    btn.addEventListener("click", () => {
      state.metric = btn.dataset.metric;
      updateButtons(controls.metricButtons, "metric", state.metric);
      onChange();
    })
  );

  controls.decadeButtons.forEach(btn =>
    btn.addEventListener("click", () => {
      state.decade = btn.dataset.decade;
      updateButtons(controls.decadeButtons, "decade", state.decade);
      populateRaceDropdown(state.decade);
      onChange();
    })
  );

  controls.raceSelect.addEventListener("change", e => {
    state.race = e.target.value;
    onChange();
  });

  controls.sexSelect.addEventListener("change", e => {
    state.sex = e.target.value;
    onChange();
  });

  controls.ageSelect.addEventListener("change", e => {
    state.age = e.target.value;
    onChange();
  });
}

// DATA LOADING
// AI: details in citations under "Data Loading'

async function loadData() {
  const [usStates, usCounties, rawData] = await Promise.all([
    d3.json("https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json"),
    d3.json("https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json"),
    d3.csv("data/mydata.csv")  
  ]);

  rawData.forEach(row => row.fips = String(row.fips).padStart(5, "0"));

  return {
    dataByFips: new Map(rawData.map(row => [row.fips, row])),
    stateData: {
      features: topojson.feature(usStates, usStates.objects.states).features,
      rows: rawData.filter(r => Number(r.fips) <= 56)
    },
    countyData: {
      features: topojson.feature(usCounties, usCounties.objects.counties).features,
      rows: rawData.filter(r => Number(r.fips) > 56)
    }
  };
}

// INIT + START
function init() {
  populateAgeDropdown();
  populateRaceDropdown(state.decade);

  updateButtons(controls.levelButtons, "level", state.geoLevel);
  updateButtons(controls.metricButtons, "metric", state.metric);
  updateButtons(controls.decadeButtons, "decade", state.decade);
}

async function start() {
  try {
    init();

    const { dataByFips, stateData, countyData } = await loadData();

    const redraw = () => {
      const geo = state.geoLevel === "state" ? stateData : countyData;
      renderMap(geo, dataByFips);
    };

    bindControls(redraw);
    redraw();

  } catch (err) {
    console.error("Dashboard init failed:", err);
  }
}

start();
