const margin = { t: 50, r: 50, b: 50, l: 50 };
const size = { w: 1000, h: 800 };
const svg = d3.select("svg#sankey");

svg.attr("width", size.w).attr("height", size.h);

const containerG = svg
	.append("g")
	.classed("container", true)
	.attr("transform", `translate(${margin.t}, ${margin.l})`);
size.w = size.w - margin.l - margin.r;
size.h = size.h - margin.t - margin.b;

d3.json("data/energy.json").then(function (data) {
	console.log(data);
	drawSankey(data);
});

function drawSankey(data) {
	// create color scale
	let colorScale = d3.scaleOrdinal(d3.schemeSet3.reverse());

	// generate sankey layout
	let sankeyLayout = d3
		.sankey()
		.nodeId((d) => d.index)
		.nodeWidth(15)
		.nodePadding(15)
		.extent([
			[0, 0],
			[size.w, size.h],
		]);
	let sankey = sankeyLayout(data);

	// add nodes
	let nodes = containerG
		.selectAll("rect")
		.data(sankey.nodes)
		.join("rect")
		.attr("x", (d) => d.x0)
		.attr("y", (d) => d.y0)
		.attr("width", 15)
		.attr("height", (d) => d.y1 - d.y0)
		.attr("fill", (d) => (d.color = colorScale(d.name)))
		.attr("fill-opacity", 0.8)
		.attr("stroke", "#ccc")
		.attr("stroke-width", "1");

	// add links
	let links = containerG
		.selectAll("path")
		.data(sankey.links)
		.join("path")
		.attr("d", d3.sankeyLinkHorizontal())
		.attr("stroke-width", (d) => d.width)
		.attr("opacity", 0.4);

	// add gradient to links
	links.style("stroke", (d, i) => {
		let gradientID = `gradient${i}`;
		let startColor = d.source.color;
		let stopColor = d.target.color;

		let linearGradient = containerG
			.append("defs")
			.append("linearGradient")
			.attr("id", gradientID);

		linearGradient
			.selectAll("stop")
			.data([
				{ offset: "10%", color: startColor },
				{ offset: "90%", color: stopColor },
			])
			.enter()
			.append("stop")
			.attr("offset", (d) => d.offset)
			.attr("stop-color", (d) => d.color);

		return `url(#${gradientID})`;
	});

	// add labels
	let labels = containerG
		.selectAll("text")
		.data(sankey.nodes)
		.join("text")
		.text((d) => d.name)
		.classed("label", true)
		.attr("text-anchor", (d) => (d.x0 < size.w / 2 ? "start" : "end"))
		.attr("alignment-baseline", "middle")
		.attr(
			"transform",
			(d) =>
				`translate(${d.x0 < size.w / 2 ? d.x0 + 19 : d.x0 - 4}, ${
					(d.y1 + d.y0) / 2
				})`
		);
}
