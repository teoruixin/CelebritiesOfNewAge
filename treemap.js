// Treemap for total count of YouTubers per country 

// Import data into the "youtube" object.
const youtube = await d3.csv("data/Global YouTube Statistics.csv");

// Make chart.

// Declare the chart dimensions and margins.
const width = 800;
const height = 400;
const marginTop = 30;
const marginRight = 30;
const marginBottom = 30;
const marginLeft = 30;

// console.log(youtube)
// Get unique countries
const countries = [...new Set(youtube.map(d => d.Country))]
// console.log(countries)

// Count of youtubers per country
function countYoutubers(country) {
    var count = 0;
    var youtuberCount = {}
    for (var i = 0; i < youtube.length; i++) {
        if (youtube[i].Country == country) {
            count++;
            youtuberCount["country"] = country;
            youtuberCount["value"] = count;
        }
    }
    return youtuberCount;
}

var countriesYoutubers = []
for (var i = 0; i < countries.length; i++) {
    // console.log(countYoutubers(countries[i]))
    countriesYoutubers[i] = countYoutubers(countries[i])
}
// console.log(countriesYoutubers)

var data = {
    "name": "Youtubers By Countries",
    "children": countriesYoutubers
};
// console.log(data)

// Create the SVG container, here named "graph". Specify size in width and height above ^
const graph = d3.select("#treemap")
    .append("svg")
    .attr("width", width + marginLeft + marginRight)
    .attr("height", height + marginTop + marginBottom)
    .append("g")
    .attr("transform",
        "translate(" + marginLeft + "," + marginTop + ")");

const color = d3.scaleOrdinal(d3.schemeCategory10)

// Give the data to this cluster layout:
var root = d3.hierarchy(data).sum(d => d.value).sort((a,b) => b.value - a.value) // Here the size of each leave is given in the 'value' field in input data

// Then d3.treemap computes the position of each element of the hierarchy
var treemap = d3.treemap()
    .size([width, height])
    .padding(2)
    (root)

let parentArray = treemap.descendants().filter(d => d.depth == 1)
let matchParent = (category) => {
    return parentArray.find(d => d.data.country == category)
}

// use this information to add rectangles:
graph
  .selectAll("rect")
  .data(parentArray)
  .enter()
  .append("rect")
    .attr('x', d => d.x0)
    .attr('y', d => d.y0)
    .attr('width', d => (d.x1 - d.x0))
    .attr('height', d => (d.y1 - d.y0))
    .style("stroke", "black")
    .style("fill", d => color(matchParent(d.parent.data.country)))

// and to add the text labels
graph
  .selectAll("text")
  .data(parentArray)
  .enter()
  .append("text")
    .attr("x", d => (d.x0+5))  // +10 to adjust position (more right)
    .attr("y", d => (d.y0+20))    // +20 to adjust position (lower)
    .text(d => d.data.country + " - " + d.value)
    .attr("font-size", "15px")
    .attr("fill", "white")

// Append the graph element to the element with id "example_chart".
treemap.append(graph.node());