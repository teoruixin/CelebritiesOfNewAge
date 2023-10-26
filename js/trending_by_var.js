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

    // Dataset is actually two datasets, from 2017-2018 and 2020 to 2023.
    // We need to know the % of dates in set 1 and % of dates in set 2.
    const split_date = Date.parse("2019-01-01");

    var pre_split = data.filter(row => row.date <= split_date);
    var pre_split_dates = [];
    for (var record of pre_split) {
        if (pre_split_dates.includes(record["date"])) { continue; }
        pre_split_dates.push(record["date"]);
    }
    const pre_split_max = Math.max(...pre_split_dates);

    var post_split = data.filter(row => row.date > split_date);
    var post_split_dates = [];
    for (var record of post_split) {
        if (post_split_dates.includes(record["date"])) { continue; }
        post_split_dates.push(record["date"]);
    }
    const post_split_min = Math.min(...post_split_dates);

    // console.log("pre_split_n: ", pre_split_dates)
    // console.log("pre_split_max: ", pre_split_max)

    // console.log("post_split_n: ", post_split_dates)
    // console.log("post_split_min: ", post_split_min)

    const pre_split_len = pre_split_dates.length;
    const post_split_len = post_split_dates.length;
    const total_len = pre_split_len + post_split_len;
    const pre_split_perc = pre_split_len / total_len;
    const post_split_perc = post_split_len / total_len;

    // Pass the info to the functions. Used for domain calculation.
    const split_info = {
        pre_split_perc: pre_split_perc,
        post_split_perc: post_split_perc,
        pre_split_max: pre_split_max,
        post_split_min: post_split_min
    }

    // Generate graph
    fn_trending_by_count(data, split_info);
    fn_trending_by_views(data, split_info);

}).catch(error => {
    console.log(error);
});

function fn_trending_by_count(data, split_info) {
    // Make chart.

    // Declare the chart dimensions and margins.
    const width = 1080;
    const height = 400;
    const marginTop = 20;
    const marginRight = 20;
    const marginBottom = 30;
    const marginLeft = 80;

    // Split info
    const blank_perc = 0.10;

    const filled_width = (width - marginRight - marginLeft) * (1-blank_perc);
    const pre_split_last_px = (split_info.pre_split_perc * filled_width) + marginLeft;
    const post_split_first_px = width - marginRight - (split_info.post_split_perc * filled_width);
    // console.log(pre_split_last_px, post_split_first_px);
    // console.log("diff:", post_split_first_px - pre_split_last_px);
    // console.log("blank:", blank_perc * (width - marginRight - marginLeft))

    // Create the SVG container, here named "graph". Specify size in width and height above ^
    var graph = d3.create("svg")
        .attr("width", width)
        .attr("height", height);

    // Declare the x scale. 
    const xscale = d3.scaleUtc() // .domain([d3.min(data, d => d.date), d3.max(data, d => d.date)]).range([marginLeft, width - marginRight]);
        .domain([
            d3.min(data, d => d.date), 
            split_info.pre_split_max, 
            split_info.post_split_min,
            d3.max(data, d => d.date)
        ])
        .range([
            marginLeft, 
            pre_split_last_px, 
            post_split_first_px, 
            width - marginRight
        ]);

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

function fn_trending_by_views(data, split_info) {
    // Make chart.

    // Declare the chart dimensions and margins.
    const width = 1080;
    const height = 400;
    const marginTop = 20;
    const marginRight = 20;
    const marginBottom = 30;
    const marginLeft = 80;

    // Split info
    const blank_perc = 0.10;
    
    const filled_width = (width - marginRight - marginLeft) * (1-blank_perc);
    const pre_split_last_px = (split_info.pre_split_perc * filled_width) + marginLeft;
    const post_split_first_px = width - marginRight - (split_info.post_split_perc * filled_width);
    // console.log(pre_split_last_px, post_split_first_px);
    // console.log("diff:", post_split_first_px - pre_split_last_px);
    // console.log("blank:", blank_perc * (width - marginRight - marginLeft))

    // Create the SVG container, here named "graph". Specify size in width and height above ^
    var graph = d3.create("svg")
        .attr("width", width)
        .attr("height", height);

    // Declare the x scale. 
    const xscale = d3.scaleUtc() // .domain([d3.min(data, d => d.date), d3.max(data, d => d.date)]).range([marginLeft, width - marginRight]);
        .domain([
            d3.min(data, d => d.date), 
            split_info.pre_split_max, 
            split_info.post_split_min,
            d3.max(data, d => d.date)
        ])
        .range([
            marginLeft, 
            pre_split_last_px, 
            post_split_first_px, 
            width - marginRight
        ]);

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