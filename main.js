import "./style.css";

import * as d3 from "d3";

const width = screen.availWidth > 600 ? 600 : screen.availWidth;
const height = screen.availHeight > 600 ? 600 : screen.availHeight;
const min = d3.min([width, height]);
const radius = (min - 20) / 2;

const svg = d3.create("svg").attr("width", min).attr("height", min);
canvas.append(svg.node());

const g = svg
  .append("g")
  .attr("transform", `translate(${min / 2}, ${min / 2})`);

g.append("circle")
  .attr("r", radius)
  .attr("stroke", "white")
  .attr("fill", "none");

let it = 1;
let multiplier = 0.1;
const divisions = 150;

document.querySelector("#divisions").innerText = `Divisions: ${it}`;
document.querySelector(
  "#multiplier"
).innerText = `Multiplier: ${multiplier.toFixed(2)}`;

const improvedInterval = (cb, tickFn) => {
  const tick = tickFn();
  const interval = setInterval(() => {
    if (tickFn() !== tick) {
      clearInterval(interval);
      if (tickFn() !== null) improvedInterval(cb, tickFn);
    } else cb();
  }, tick);
};

const tickSpeed = () =>
  document.querySelector("#tickSpeedMultiplier").value === ""
    ? 1
    : parseFloat(document.querySelector("#tickSpeedMultiplier").value, 10) <= 0
    ? 1
    : parseFloat(document.querySelector("#tickSpeedMultiplier").value, 10);

let ready = false;
improvedInterval(
  () => {
    if (ready) return;

    const scale = d3
      .scaleLinear()
      .domain([0, it])
      .range([0, 2 * Math.PI]);

    g.selectAll("line").remove();
    g.selectAll("line")
      .data(new Array(it).fill(0).map((_, i) => i))
      .enter()
      .append("line")
      .attr("stroke", "white")
      .attr("x1", (d) => radius * Math.cos(scale(d)))
      .attr("y1", (d) => radius * Math.sin(scale(d)))
      .attr("x2", (d) => radius * Math.cos(scale(d * multiplier)))
      .attr("y2", (d) => radius * Math.sin(scale(d * multiplier)));

    if (it === divisions) ready = true;
    else it++;

    document.querySelector("#divisions").innerText = `Divisions: ${it}`;
  },
  () =>
    console.log(tickSpeed()) ||
    (it > divisions ? null : it >= divisions / 3 ? 20 : 50) / tickSpeed()
);

const scale = d3
  .scaleLinear()
  .domain([0, divisions])
  .range([0, 2 * Math.PI]);

let reversing = false;
improvedInterval(
  () => {
    if (!ready) return;

    g.selectAll("line")
      .transition()
      .duration(50)
      .attr("x1", (d) => radius * Math.cos(scale(d)))
      .attr("y1", (d) => radius * Math.sin(scale(d)))
      .attr("x2", (d) => radius * Math.cos(scale(d * multiplier)))
      .attr("y2", (d) => radius * Math.sin(scale(d * multiplier)))
      .attr("stroke", "white");

    const allowReversing = document.querySelector("#allowReversing").checked;
    if (reversing && allowReversing) {
      if (multiplier <= 8.5) {
        reversing = false;
      } else {
        multiplier -= 0.01;
      }
    } else {
      if (multiplier >= 12 && allowReversing) {
        reversing = true;
      } else {
        multiplier += 0.01;
      }
    }

    document.querySelector(
      "#multiplier"
    ).innerText = `Multiplier: ${multiplier.toFixed(2)}`;
  },
  () => 50 / tickSpeed()
);
