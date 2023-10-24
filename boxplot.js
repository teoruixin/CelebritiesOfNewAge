// Declare the chart dimensions and margins.
const chartWidth = 1000;
const chartHeight = 400;
var margin = {top: 10, right: 30, bottom: 80, left: 40},
width = chartWidth - margin.left - margin.right,
height = chartHeight - margin.top - margin.bottom;

const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];


function updateChart() {
    country = document.getElementById("country").value
    month = document.getElementById("month").value
    getEarlyData(country, month)
    getLateData(country, month)
}

function getEarlyData(country, month){
    d3.csv("data/awc_early/" + country + ".csv", (row, i) => {
        return {
            category: row.category,
            title: row.title,
            channel: row.channel_title,
            views: +row.views,
            views_log: Math.log10(+row.views),
            month: months[Number(row.trending_date.slice(-2))-1],
            year: Number(row.trending_date.slice(0,2)),
            key: i
        };
    }).then(rows => {
        rows = rows.filter(function(d) { return d.month == month && d.year == 18; })
        rows = rows.filter((v, i, a) => a.findLastIndex(v2=>(v2.title === v.title))===i)
        rows.sort(function(a,b) { return (a.category).localeCompare(b.category); });
        // console.log(rows);
        update(rows, country, month, "2018", "early")
        
    }).catch(error => {
        console.log(error);
    });
}

function getLateData(country, month){
    d3.csv("data/awc_late/"+ country + ".csv", (row, i) => {
        return {
            category: row.category,
            title: row.title,
            channel: row.channel_title,
            views: +row.views,
            views_log: Math.log10(+row.views),
            month: months[Number(row.trending_date.slice(5,7))-1],
            year: Number(row.trending_date.slice(0,4)),
            key: i
        };
    }).then(rows => {
        rows = rows.filter(function(d) { return d.month == month && d.year == 2022; })
        rows = rows.filter((v, i, a) => a.findLastIndex(v2=>(v2.title === v.title))===i)
        rows.sort(function(a,b) { return (a.category).localeCompare(b.category); });
        update(rows, country, month, "2022", "late")
        // console.log(rows);
    }).catch(error => {
        console.log(error);
    });
}

// Read the data and compute summary statistics for each specie
d3.csv("data/awc_early/US.csv", (row, i) => {
    return {
        category: row.category,
        title: row.title,
        channel: row.channel_title,
        views: +row.views,
        views_log: Math.log10(+row.views),
        month: Number(row.trending_date.slice(3,5)),
        year: Number(row.trending_date.slice(0,2)),
        key: i
    };
}).then(rows => {
    rows = rows.filter(function(d) { return d.month == 5 && d.year == 18; })
    rows = rows.filter((v, i, a) => a.findLastIndex(v2=>(v2.title === v.title))===i)
    rows.sort(function(a,b) { return (a.category).localeCompare(b.category); });
    makeChart(rows, "US", "May", "2018", "early")
    // console.log(rows);
}).catch(error => {
    console.log(error);
});

d3.csv("data/awc_late/US.csv", (row, i) => {
    return {
        category: row.category,
        title: row.title,
        channel: row.channel_title,
        views: +row.views,
        views_log: Math.log10(+row.views),
        month: Number(row.trending_date.slice(5,7)),
        year: Number(row.trending_date.slice(0,4)),
        key: i
    };
}).then(rows => {
    rows.sort(function(a,b) { return b.views - a.views; })
    rows = rows.filter(function(d) { return d.month == 5 && d.year == 2022; })
    rows = rows.filter((v, i, a) => a.findLastIndex(v2=>(v2.title === v.title))===i)
    rows.sort(function(a,b) { return (a.category).localeCompare(b.category); });
    makeChart(rows, "US", "May", "2022", "late")
    // console.log(rows);
}).catch(error => {
    console.log(error);
});

var key = function(d){ return d.key; };

var x, y, boxWidth, Tooltip
var stats, q1, median, q3, interQuantileRange, min, max;
function makeChart(data, country, month, year, period){

    // append the svg object to the body of the page
    var svg = d3.select("#boxplot")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("class", period)
    .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");
    
    svg
    .append("text")
    .attr("class", "legendTitle")
    .attr("x", chartWidth/2 - 150)
    .attr("y", 10)
    .text("Views (Log) by Category in " + country + " in " + month + " " + year);

    // create a tooltip
    Tooltip = d3.select("#boxplot")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px")
    .style("position", "absolute")
    .style("width", "auto")

    boxWidth = 20

    stats = d3.rollup(data, function(d) {
        q1 = d3.quantile(d.map(function(g) { return g.views_log;}).sort(d3.ascending),.25)
        median = d3.quantile(d.map(function(g) { return g.views_log;}).sort(d3.ascending),.5)
        q3 = d3.quantile(d.map(function(g) { return g.views_log;}).sort(d3.ascending),.75)
        interQuantileRange = q3 - q1
        min = q1 - 1.5 * interQuantileRange
        max = q3 + 1.5 * interQuantileRange
        return({q1: q1, median: median, q3: q3, interQuantileRange: interQuantileRange, min: min, max: max})
    }, d => d.category)
    console.log(stats)

    //   Show the X scale
    x = d3.scaleBand()
        .range([ 0, width ])
        .domain(data.map(d=> d.category))
        .paddingInner(1)
        .paddingOuter(.5)

    var xAxis = d3.axisBottom().scale(x).ticks(0)
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .attr("class", "xaxis")
        .call(xAxis)
        .selectAll("text")
            .attr("y", 15)
            .attr("x", 9)
            .attr("dy", ".35em")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end");

    // Show the Y scale
    y = d3.scaleLinear()
        .domain([0,10])
        // .domain([d3.min(data, d => d.views_log)-2,d3.max(data, d => d.views_log)+2])
        .range([height, 0])
    svg.append("g")
        .attr("class", "yaxis")
        .call(d3.axisLeft(y))

    // // Show the main vertical line
    svg
        .selectAll(".vertLines")
        .data(stats)
        .enter()
        .append("line")
            .attr("class", "vertLines")
            .attr("x1", function(d){return(x(d[0]))})
            .attr("x2", function(d){return(x(d[0]))})
            .attr("y1", function(d){return(y(d[1].min))})
            .attr("y2", function(d){return(y(d[1].max))})
            .attr("stroke", "black")
            .style("width", 40)

    // Show max line
    svg
        .selectAll("maxLines")
        .data(stats)
        .enter()
        .append("line")
            .attr("x1", function(d){return(x(d[0])-boxWidth/2)})
            .attr("x2", function(d){return(x(d[0])+boxWidth/2)})
            .attr("y1", function(d){return(y(d[1].max))})
            .attr("y2", function(d){return(y(d[1].max))})
            .attr("stroke", "black")
            .style("width", 80)

    // Show min line
    svg
        .selectAll("minLines")
        .data(stats)
        .enter()
        .append("line")
            .attr("x1", function(d){return(x(d[0])-boxWidth/2) })
            .attr("x2", function(d){return(x(d[0])+boxWidth/2) })
            .attr("y1", function(d){return(y(d[1].min))})
            .attr("y2", function(d){return(y(d[1].min))})
            .attr("stroke", "black")
            .style("width", 80)

    // rectangle for the main box    
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

    // Add individual points
    svg
    .selectAll("indPoints")
    .data(data)
    .enter()
    .append("circle")
        .attr("cx", function(d){return(x(d.category) )})
        .attr("cy", function(d){return(y(d.views_log))})
        .attr("r", 3)
        .style("fill", "white")
        .attr("stroke", "black")
    // Interaction
    .on("mouseover", function(event, d){
        Tooltip
        .style("opacity", 1)
        d3.select(this)
        .style("stroke", "black")
        .style("opacity", 1)
        
    })
    .on("mousemove", function(event, d){
        Tooltip
        .html("<b>Video: </b>" + d.title +"<br><b>Channel: </b>" + d.channel + "<br><b>Views: </b>" + d.views)
        .style("left", (event.pageX+20) + 'px')
        .style("top", (event.pageY+20) + 'px')
    })

    .on("mouseout", function(event, d){
        Tooltip
        .style("opacity", 0)
    })


}

function update(data, country, month, year, period){
    stats = d3.rollup(data, function(d) {
        q1 = d3.quantile(d.map(function(g) { return g.views_log;}).sort(d3.ascending),.25)
        median = d3.quantile(d.map(function(g) { return g.views_log;}).sort(d3.ascending),.5)
        q3 = d3.quantile(d.map(function(g) { return g.views_log;}).sort(d3.ascending),.75)
        interQuantileRange = q3 - q1
        min = q1 - 1.5 * interQuantileRange
        max = q3 + 1.5 * interQuantileRange
        return({q1: q1, median: median, q3: q3, interQuantileRange: interQuantileRange, min: min, max: max})
    }, d => d.category)
    console.log(stats)

    var svg = d3.selectAll("#boxplot").select("." + period)

    svg
    .select(".legendTitle")
    .text("Views (Log) by Category in " + country + " in " + month + " " + year);

    //   Show the X scale
    x = d3.scaleBand()
        .range([ 0, width ])
        .domain(data.map(d=> d.category))
        .paddingInner(1)
        .paddingOuter(.5)
        
    xAxis = d3.axisBottom().scale(x).ticks(0);

    svg.selectAll(".xaxis")
        // .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .selectAll("text")
            .attr("y", 15)
            .attr("x", 9)
            .attr("dy", ".35em")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end");

    //   Show the Y scale
    y = d3.scaleLinear()
        .domain([0,10])
        // .domain([d3.min(data, d => d.views_log)-2,d3.max(data, d => d.views_log)+2])
        .range([height, 0])
    svg.selectAll(".yaxis").call(d3.axisLeft(y))

    // Show the main vertical line
    var lines = svg.selectAll("line").data(stats, key)
    lines.exit().transition().duration(1000)
        .attr("width", 0)
        .attr("opacity", 0)
        .remove()
    lines.enter().append("line")
        .attr("x1", function(d){return(x(d[0])+ margin.left)})
        .attr("x2", function(d){return(x(d[0]) + margin.left)})
        .attr("y1", function(d){return(y(d[1].min))})
        .attr("y2", function(d){return(y(d[1].max))})
        .attr("stroke", "black")
        .style("width", 40)

    // Show max line
    lines.enter().append("line")
        .attr("x1", function(d){return(x(d[0])-boxWidth/2 + margin.left)})
        .attr("x2", function(d){return(x(d[0])+boxWidth/2 + margin.left)})
        .attr("y1", function(d){return(y(d[1].max))})
        .attr("y2", function(d){return(y(d[1].max))})
        .attr("stroke", "black")
        .style("width", 80)

    // // Show min line
    lines.enter().append("line")
        .attr("x1", function(d){return(x(d[0])-boxWidth/2 + margin.left) })
        .attr("x2", function(d){return(x(d[0])+boxWidth/2 + margin.left) })
        .attr("y1", function(d){return(y(d[1].min))})
        .attr("y2", function(d){return(y(d[1].min))})
        .attr("stroke", "black")
        .style("width", 80)

    // Update box
    var boxes = svg.selectAll("rect").data(stats, key)
    boxes.exit().transition().duration(1000)
        .attr("height", 0)
        .attr("width", 0)
        .attr("opacity", 0)
        .remove()

    boxes.enter().append("rect")
        .attr("x", function(d){return(x(d[0])-boxWidth/2 + margin.left)})
        .attr("y", function(d){return(y(d[1].q3))})
        .attr("height", function(d){return(y(d[1].q1)-y(d[1].q3))})
        .attr("width", boxWidth )
        .attr("stroke", "black")
        .style("fill", "#69b3a2")

    // Show the median
    lines.enter().append("line")
        .attr("x1", function(d){return(x(d[0])-boxWidth/2 + margin.left) })
        .attr("x2", function(d){return(x(d[0])+boxWidth/2 + margin.left) })
        .attr("y1", function(d){return(y(d[1].median))})
        .attr("y2", function(d){return(y(d[1].median))})
        .attr("stroke", "black")
        .style("width", 80)

    // Add individual points
    var circles = svg.selectAll("circle").data(data, key)
    circles.exit().transition().duration(1000)
        .attr("r", 0)
        .attr("opacity", 0)
        .remove()

    circles.enter().append("circle")
        .attr("cx", function(d){return(x(d.category) + margin.left)})
        .attr("cy", function(d){return(y(d.views_log))})
        .attr("r", 3)
        .style("fill", "white")
        .attr("stroke", "black")

    // Interaction
    .on("mouseover", function(event, d){
        Tooltip
        .style("opacity", 1)
        d3.select(this)
        .style("stroke", "black")
        .style("opacity", 1)
        
    })
    .on("mousemove", function(event, d){
        Tooltip
        .html("<b>Video: </b>" + d.title +"<br><b>Channel: </b>" + d.channel + "<br><b>Views: </b>" + d.views)
        .style("left", (event.pageX+20) + 'px')
        .style("top", (event.pageY+20) + 'px')
    })

    .on("mouseout", function(event, d){
        Tooltip
        .style("opacity", 0)
    })

    
}


