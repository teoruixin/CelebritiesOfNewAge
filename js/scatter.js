var chartWidth = 1000;
var chartHeight = 500;

/********
 * Data *
 ********/

var allData;

/**************
 * Load Data  *
 **************/

var index = 0;

d3.csv("data/Global Youtube Statistics.csv", (row, i) => {
    return {
        youtuber: row.Youtuber,
        viewsDays: +row.video_views_for_the_last_30_days,
        HighestEarning: +row.highest_monthly_earnings,
        LowestEarning: +row.lowest_monthly_earnings,
        AverageEarning: (+row.highest_monthly_earnings + +row.lowest_monthly_earnings) / 2,
    };
}).then(rows => {
    allData = rows;
    makeChart(rows);
}).catch(error => {
    console.log(error);
});

/**********
 * Scales *
 **********/
var x, y;


/********
 * Axes *
 ********/

var xAxis;
var yAxis;

/**************
 * Make Chart *
 **************/

function makeChart(data) {
    data = data.filter(function (d) {
        return !isNaN(d.viewsDays);
    });

    // x position
    x = d3.scaleLinear()
        .domain(d3.extent(allData, function (d) { return d.viewsDays; }))
        .range([150, chartWidth - 25]);

    // y position
    y = d3.scaleLinear()
        .domain(d3.extent(allData, function (d) { return d.AverageEarning; }))
        .range([chartHeight - 75, 50]);

    var canvas = d3.select("#scatter")
        .attr("width", chartWidth)
        .attr("height", chartHeight)
        .style("margin-top", -40)
        .style("margin-left", -40);

    var scatter = d3.select("#scatter").selectAll("circle")
        .data(data)

    //tooltip
    var tooltip = d3.select("#scatter_div")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px")
        .style("position", "absolute")

    //ENTER
    var enter = scatter.enter().append("circle")
        .attr("fill-opacity", 0)
        .attr("cy", function (d) { return y(d.AverageEarning); })
        .attr("cx", function (d) { return x(d.viewsDays); })
        .attr("r", 5)
        .attr("stroke", "#1f78b4")
        .attr("stroke-width", "1px")
        .on("mouseover", function(event, d){
            tooltip
            .style("opacity", 1)
            d3.select(this)
            .style("stroke", "black")
            .style("opacity", 1)   
        })
        .on("mousemove", function(event, d){
            tooltip
            .html("<b>Youtuber: </b>" + d.youtuber +"<br><b>Video views: </b>" + d.viewsDays + "<br><b>Average earnings: </b>" + d.AverageEarning)
            .style("left", (event.pageX+20) + 'px')
            .style("top", (event.pageY+20) + 'px')
        })
    
        .on("mouseout", function(event, d){
            d3.select(this)
            .style("stroke", "#1f78b4")
            tooltip
            .style("opacity", 0)
            
        })


        // .on("mouseover", function (event, d) {
        //     d3.select(this).transition()
        //         .attr("stroke-width", "5px")
        //         .attr("r", 7);
        //     tooltip.transition()
        //         .duration(100)
        //         .style("opacity", 1);
        // })
        // .on("mouseout", function (event, d) {
        //     d3.select(this).transition()
        //         .attr("stroke-width", "1px")
        //         .attr("r", 5);

        //     tooltip.transition()
        //         .duration('200')
        //         .style("opacity", 0);
        // });

    // Add a title to the point (on mouseover)
    // enter.append("svg:title")
    //     .text(function (d) {
    //         return "Youtuber: " + d.youtuber + "\n" +
    //             "Video views: " + d.viewsDays + "\n" +
    //             "Average earnings: " + d.AverageEarning + "\n"
    //     });

    //ENTER + UPDATE
    enter.merge(scatter)
        .attr("cy", function (d) { return y(d.AverageEarning); })
        .attr("cx", function (d) { return x(d.viewsDays); });

    xAxis = d3.axisBottom()
        .scale(x)
        .tickFormat(d => (d / 1000000000).toFixed(1) + "B"); // Display in billions;

    yAxis = d3.axisLeft()
        .scale(y)
        .tickFormat(d => (d / 1000000).toFixed(0) + "M"); // Display in millions;;

    var yAxisGroup = canvas.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(150,0)")
        .call(yAxis);

    yAxisGroup.selectAll("text")
        .attr("transform", "translate(0,0)")

    var xAxisGroup = canvas.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + (chartHeight - 75) + ")")
        .call(xAxis);

    xAxisGroup.selectAll("text")
        .style("text-anchor", "middle")
        .attr("dy", "1em");

    canvas.append("text")
        .attr("class", "x-axis-label")
        .attr("text-anchor", "middle")
        .attr("x", chartWidth / 2 + 60)
        .attr("y", chartHeight - 30)
        .text("Video Views for the Last 30 Days")
        .attr("font-size", "13px")
        .style("font-weight", "bold");

    canvas.append("text")
        .attr("class", "y-axis-label")
        .attr("text-anchor", "middle")
        .attr("x", 60)
        .attr("y", chartHeight / 2 + 35)
        .attr("transform", "rotate(-90 30," + (chartHeight / 2) + ")")
        .text("Average Monthly Income")
        .attr("font-size", "13px")
        .style("font-weight", "bold");
}
