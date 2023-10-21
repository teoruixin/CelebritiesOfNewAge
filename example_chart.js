
// This chart is <insert chart description.>

// Import data into the "youtube" object.
const youtube = await d3.csv("data/Global YouTube Statistics.csv");

// Make chart.

// Declare the chart dimensions and margins.
const width = 640;
const height = 400;
const marginTop = 20;
const marginRight = 20;
const marginBottom = 30;
const marginLeft = 80;

// Create the SVG container, here named "graph". Specify size in width and height above ^
const graph = d3.create("svg")
    .attr("width", width)
    .attr("height", height);

// Scales are functions that take in a number in their domain and spit out a number in their range.

// Can also use scaleUtc() for dates
// const xscale = d3.scaleUtc()
//     .domain([new Date("2004-01-01"), new Date("2024-01-01")]) 
//     .range([marginLeft, width - marginRight]);                 

// Declare the x scale. 
const xscale = d3.scaleLinear()
    .domain([2004, 2023])                       // domain is the size of the data
    .range([marginLeft, width-marginRight]);    // range is the size of the scale

// Declare the y scale. 
const yscale = d3.scaleLinear()
    .domain([0, 245000000])         // Since domain is the size of the data, we should invoke
    .range([height - marginBottom, marginTop]);     // the dataset youtube in the above line

// Declare any other scales.
// This one maps Category to a colour.
const colour = d3.scaleOrdinal()
  .domain(youtube.map(d => d.category))
  .range(d3.schemeTableau10)

// Add the x-axis.
graph.append("g")
    // translate() takes in axis starting point (x,y). 0,0 is the top left.
    // margins are specified in const x above, so start at 0.
    .attr("transform", `translate(0, ${height - marginBottom})`)
    .call(d3.axisBottom(xscale));

// Add the y-axis. This is vertical that starts at 0,0 (top left) and goes downwards.
graph.append("g")
    .attr("transform", `translate(${marginLeft},0)`)
    .call(d3.axisLeft(yscale));

// Add data to chart.

const helpme = graph
    .selectAll('circle')
    .data(youtube)
    .join('circle')
    .attr('opacity', 0.75)
    .attr('r', 4)
    .attr('cx', d => xscale(d.created_year))
    .attr('cy', d => yscale(d.subscribers))
    .attr('fill', d => colour(d.category));
    // // .attr('r', d => size(d.pop));

// Append the graph element to the element with id "example_chart".
example_chart.append(graph.node());
