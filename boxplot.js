// Treemap for total count of YouTubers per country 

// Import data into the "youtube" object.
// const trendingUS = await d3.csv("data/awc_early/US.csv");

// Make chart.

// Declare the chart dimensions and margins.
const chartWidth = 1500;
const chartHeight = 600;
var margin = {top: 10, right: 30, bottom: 30, left: 40},
width = chartWidth - margin.left - margin.right,
height = chartHeight - margin.top - margin.bottom;


// Read the data and compute summary statistics for each specie
d3.csv("data/awc_early/US.csv", (row, i) => {
    return {
        category: row.category,
        views: Math.log10(+row.views),
        month: Number(row.trending_date.slice(3,5)),
        year: Number(row.trending_date.slice(0,2)),
        key: i
    };
}).then(rows => {
    rows.sort(function(a,b) { return b.views - a.views; })
    rows = rows.filter(function(d) { return d.month == 5 && d.year == 18; })
    makeChart(rows)
    // console.log(rows);
})

var stats, q1, median, q3, interQuantileRange, min, max;
function makeChart(data){
    // q1 = d3.rollup(data, v => d3.quantile(v, d => d.views, 0.25), d => d.category)
    // median = d3.rollup(data, v => d3.median(v, d => d.views), d => d.category)
    // console.log(q1)

    stats = d3.rollup(data, function(d) {
        q1 = d3.quantile(d.map(function(g) { return g.views;}).sort(d3.ascending),.25)
        median = d3.quantile(d.map(function(g) { return g.views;}).sort(d3.ascending),.5)
        q3 = d3.quantile(d.map(function(g) { return g.views;}).sort(d3.ascending),.75)
        interQuantileRange = q3 - q1
        min = q1 - 1.5 * interQuantileRange
        max = q3 + 1.5 * interQuantileRange
        return({q1: q1, median: median, q3: q3, interQuantileRange: interQuantileRange, min: min, max: max})
    }, d => d.category)
    // stats2 = Object.entries(stats).sort(function(a,b) { return b[1].max - a[1].max; })
    // stats.sort(function(a,b) { return b[1].max - a[1].max; })
    console.log(stats)
    
    // append the svg object to the body of the page
    var svg = d3.select("#boxplot")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    //   Show the X scale
    var x = d3.scaleBand()
        .range([ 0, width ])
        .domain(data.map(d=> d.category))
        .paddingInner(1)
        .paddingOuter(.5)
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))

    // Show the Y scale
    var y = d3.scaleLinear()
        .domain([0,d3.max(data, d => d.views)+2])
        .range([height, 0])
    svg.append("g").call(d3.axisLeft(y))

    // rectangle for the main box
    var boxWidth = 50
    svg
        .selectAll("boxes")
        .data(stats)
        .enter()
        .append("rect")
            .attr("x", function(d){return(x(d[0])-boxWidth/2)})
            .attr("y", function(d){return(y(d[1].q3))})
            .attr("height", function(d){return(y(d[1].q1)-y(d[1].q3))})
            .attr("width", boxWidth )
            .attr("stroke", "black")
            .style("fill", "#69b3a2")

    // Show the main vertical line
    svg
        .selectAll("vertLines")
        .data(stats)
        .enter()
        .append("line")
        .attr("x1", function(d){return(x(d[0]))})
        .attr("x2", function(d){return(x(d[0]))})
        .attr("y1", function(d){return(y(d[1].min))})
        .attr("y2", function(d){return(y(d[1].max))})
        .attr("stroke", "black")
        .style("width", 40)

    // // Show the median
    svg
        .selectAll("medianLines")
        .data(stats)
        .enter()
        .append("line")
        .attr("x1", function(d){return(x(d[0])-boxWidth/2) })
        .attr("x2", function(d){return(x(d[0])+boxWidth/2) })
        .attr("y1", function(d){return(y(d[1].median))})
        .attr("y2", function(d){return(y(d[1].median))})
        .attr("stroke", "black")
        .style("width", 80)

    // Add individual points with jitter
    // var jitterWidth = 50
    svg
    .selectAll("indPoints")
    .data(data)
    .enter()
    .append("circle")
        .attr("cx", function(d){return(x(d.category) )})
        .attr("cy", function(d){return(y(d.views))})
        .attr("r", 4)
        .style("fill", "white")
        .attr("stroke", "black")
}


