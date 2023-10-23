// This chart plots the number of Youtubers per category against the year of their channel creation.

// Import data
await d3.csv("data/Global YouTube Statistics.csv", (row, i) => {
    return {
        category: row.category,
        youtuber: row.Youtuber,
        created_year: row.created_year,
        // created_month: row.created_month,
        // created_date: row.created_date
    };
}).then(rows => {
    // filter out NaNs, then rows where the year is before 2005 (Youtube started)
    rows = rows.filter(row => row.category !== "nan" && row.created_year !== "nan");
    rows = rows.filter(row => row.created_year >= 2005);

    // count number of YouTubers per category per year
    var catCountsByYear = d3.flatRollup(
        rows,
        v => v.length,
        d => d.category,
        d => d.created_year
    );      // output: [ [category, year, count], [], ...]

    var data = Array.from(catCountsByYear, ([category, year, count]) => ({
        category: category,
        year: parseInt(year),
        count: count
    }));    // output: [{category: Music, year: 2005, count: 21}, {}, ..., {}]

    // sort by category, then year
    data = data.sort((a, b) => {
        if (a.category != b.category) {
            return a.category.localeCompare(b.category)
        } else {
            return a.year - b.year
        }
    });

    // Generate graph
    cat_by_created_year(data);

}).catch(error => {
    console.log(error);
});

function cat_by_created_year(data) {
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

    // Declare the x scale. 
    const xscale = d3.scaleLinear()
        .domain([d3.min(data, d => d.year) - 1, d3.max(data, d => d.year)])
        .range([marginLeft, width - marginRight]);

    // Declare the y scale. 
    const yscale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.count) + 1])
        .range([height - marginBottom, marginTop]);

    // Declare other scales.
    // This one maps Category to a colour.
    const colour = d3.scaleOrdinal()
        .domain(data.map(d => d.category))
        .range(d3.schemeTableau10)

    // Add the x-axis.
    graph.append("g")
        // translate() takes in axis starting point (x,y). 0,0 is the top left. margins are specified in const x above, so start at 0.
        .attr("transform", `translate(0, ${height - marginBottom})`)
        .call(d3.axisBottom(xscale));

    // Add the y-axis. This is vertical that starts at 0,0 (top left) and goes downwards.
    graph.append("g")
        .attr("transform", `translate(${marginLeft},0)`)
        .call(d3.axisLeft(yscale));

    // Plot points.
    graph.selectAll('circle')
        .data(data)
        .join('circle')
        .attr('opacity', 0.75)
        .attr('r', 2.5)
        .attr('cx', d => xscale(d.year))
        .attr('cy', d => yscale(d.count))
        .attr('fill', d => colour(d.category));

    // Plot lines.
    // 1) Group data
    var groupedData = Array.from(
        d3.group(data, d => d.category), ([category, data]) => ({ category, data })
    );

    // 2) define line generator
    var lineGenerator = d3.line()	
        .x(function(d) { return xscale(d.year); })
        .y(function(d) { return yscale(d.count); })
        // .curve(d3.curveCardinal);
        .curve(d3.curveNatural);
        
    // 3) Plot lines by for-loop over categories
    for (var catData of groupedData) {
        graph.append("path")
            .attr("class", "line")
            .style("fill","none")
            .attr('opacity', 0.75)
            .style("stroke", colour(catData.category))
            .style("stroke-width", 1.5)
            .attr("d", lineGenerator(catData.data))
    }

    // Append the graph element to the element with id "example_chart".
    category_by_year.append(graph.node());
}
