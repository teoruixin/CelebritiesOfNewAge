// This chart plots the number/view of trending videos per category against the date they trended on.

// Import data
await d3.csv("data/trending_summary/CA_summary.csv", (row, i) => {
    return {
        date: Date.parse((row.month) + "-01"),
        category: row.category,
        count: parseInt(row.count),
        views: parseInt(row.views),
        // created_month: row.created_month,
        // created_date: row.created_date
    };
}).then(data => {
    // filter out category "29" (can't find any information on it)
    data = data.filter(row => row.category !== "29");
    console.log(data)

    // Generate graph
    fn_trending_by_count(data);
    fn_trending_by_views(data);

}).catch(error => {
    console.log(error);
});

function fn_trending_by_count(data) {
    // Make chart.

    // Declare the chart dimensions and margins.
    const width = 1080;
    const height = 400;
    const marginTop = 20;
    const marginRight = 20;
    const marginBottom = 30;
    const marginLeft = 80;

    // Create the SVG container, here named "graph". Specify size in width and height above ^
    var graph = d3.create("svg")
        .attr("width", width)
        .attr("height", height);

    // Declare the x scale. 
    const xscale = d3.scaleUtc()
        .domain([d3.min(data, d => d.date), d3.max(data, d => d.date)])
        .range([marginLeft, width - marginRight]);

    // Declare the y scale. 
    const yscale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.count)])
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
        .attr('cx', d => xscale(d.date))
        .attr('cy', d => yscale(d.count))
        .attr('fill', d => colour(d.category));

    // Plot lines.
    // 1) Group data
    var groupedData = Array.from(
        d3.group(data, d => d.category), ([category, data]) => ({ category, data })
    );

    // 2) define line generator
    var lineGenerator = d3.line()	
        .x(function(d) { return xscale(d.date); })
        .y(function(d) { return yscale(d.count); });
        // .curve(d3.curveCardinal);
        // .curve(d3.curveNatural);
        
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

    // d3.select("example_chart").append(graph.node());
    // console.log(container)

    // Append the graph element to the element with id "trending_by_count".
    trending_by_count.append(graph.node());
}

function fn_trending_by_views(data) {
    // Make chart.

    // Declare the chart dimensions and margins.
    const width = 1080;
    const height = 400;
    const marginTop = 20;
    const marginRight = 20;
    const marginBottom = 30;
    const marginLeft = 80;

    // Create the SVG container, here named "graph". Specify size in width and height above ^
    var graph = d3.create("svg")
        .attr("width", width)
        .attr("height", height);

    // Declare the x scale. 
    const xscale = d3.scaleUtc()
        .domain([d3.min(data, d => d.date), d3.max(data, d => d.date)])
        .range([marginLeft, width - marginRight]);

    // Declare the y scale. 
    const yscale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.views)])
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
        .attr('cx', d => xscale(d.date))
        .attr('cy', d => yscale(d.views))
        .attr('fill', d => colour(d.category));

    // Plot lines.
    // 1) Group data
    var groupedData = Array.from(
        d3.group(data, d => d.category), ([category, data]) => ({ category, data })
    );

    // 2) define line generator
    var lineGenerator = d3.line()	
        .x(function(d) { return xscale(d.date); })
        .y(function(d) { return yscale(d.views); });
        // .curve(d3.curveCardinal);
        // .curve(d3.curveNatural);
        
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

    // d3.select("example_chart").append(graph.node());
    // console.log(container)

    // Append the graph element to the element with id "trending_by_views".
    trending_by_views.append(graph.node());
}