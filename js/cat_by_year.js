// This chart plots the number of Youtubers per category against the year of their channel creation.

// Import data
await d3.csv("data/Global YouTube Statistics.csv", (row, i) => {
    return {
        category: row.category,
        youtuber: row.Youtuber,
        created_year: row.created_year, // Convert to string,
        // created_month: row.created_month,
        // created_date: row.created_date
    };
}).then(rows => {
    // filter out NaNs, then rows where the year is before 2005 (Youtube started)
    rows = rows.filter(row => row.category !== "nan" && row.created_year !== "nan");
    rows = rows.filter(row => row.created_year >= 2005);
    rows = rows.filter(row => !["Autos & Vehicles", "Education", "Pets & Animals", "Movies", "Howto & Style", 
    "News & Politics", "Science & Technology", "Shows", "Travel & Events"].includes(row.category));

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
    const width = 1000;
    const height = 500;
    const marginTop = 20;
    const marginRight = 50;
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
        .range(d3.schemeSet3)

    // Add the x-axis.
    graph.append("g")
        // translate() takes in axis starting point (x,y). 0,0 is the top left. margins are specified in const x above, so start at 0.
        .attr("transform", `translate(0, ${height - marginBottom})`)
        .call(d3.axisBottom(xscale)
            .tickFormat(d3.format("d")) // Format as integers
        )
        .append("text")
            .text("Year")
            .attr("x", width - 15)
            .attr("dy", 3)
            .style("text-anchor", "end")
            .style("fill", "black")
            .style("font-size", "13px")
            .style("font-weight", "bold");;

    // Add the y-axis. This is vertical that starts at 0,0 (top left) and goes downwards.
    graph.append("g")
        .attr("transform", `translate(${marginLeft},0)`)
        .call(d3.axisLeft(yscale))
        .append("text")
            .text("No. of Channels")
            .attr("y", 10)
            .attr("dx", 45)
            .style("text-anchor", "end")
            .style("fill", "black")
            .style("font-size", "13px")
            .style("font-weight", "bold");;

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

    // Add a legend
    const legend = graph.append("g")
        .attr("transform", `translate(${width - 130}, 10)`);

    // Create a legend title
    legend.append("text")
        .text("Categories")
        .attr("dy", "0.35em")
        .attr("font-weight", "bold")
        .attr("font-size", "14px");

    // Create legend items
    const categories = Array.from(new Set(data.map(d => d.category)));
    categories.forEach((category, index) => {
        const legendItem = legend.append("g")
            .attr("transform", `translate(0, ${index * 13 + 20})`);

        legendItem.append("circle")
            .attr("r", 3.5)
            .attr("fill", colour(category));

        legendItem.append("text")
            .text(category)
            .attr("x", 10)
            .attr("dy", "0.32em")
            .attr("font-size", "12px");
    });

    // Append the graph element to the element with id "example_chart".
    category_by_year.append(graph.node());
}
