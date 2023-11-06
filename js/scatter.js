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
var x,y;


/********
 * Axes *
 ********/

var xAxis;
var yAxis;

/**************
 * Make Chart *
 **************/

function makeChart(data){
    data = data.filter(function(d) {
        return !isNaN(d.viewsDays);
    });

    // y position
    y = d3.scaleLinear()
        .domain(d3.extent(allData,function(d){ return d.viewsDays; }))
        .range([chartHeight-75, 50]);

    // x position
    x = d3.scaleLinear()
        .domain(d3.extent(allData,function(d){ return d.AverageEarning; }))
        .range([150,chartWidth-25]);

    var canvas = d3.select("#scatter")
        .style("width",chartWidth)
        .style("height",chartHeight)
        .style("margin-top", -40)
        .style("margin-left", -40);

    var scatter = d3.select("#scatter").selectAll("circle")
        .data(data)

    //tooltip
    var tooltip = d3.select("#scatter")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("padding", "10px")

    //ENTER
    var enter = scatter.enter().append("circle")
        .attr("fill-opacity",0)
        .attr("cx", function(d) { return x(d.AverageEarning); })
        .attr("cy", function(d) { return y(d.viewsDays); })
        .attr("r",function(d){ return 5;})
        .attr("stroke", "#1f78b4") 
        .attr("stroke-width","1px")
        .on("mouseover", function(event, d){ 
        d3.select(this).transition()
            .attr("stroke-width", "5px")
            .attr("r", 7);
            tooltip.transition()
            .duration(100)
            .style("opacity", 1);
        })
        .on("mouseout", function(event, d){ 
        d3.select(this).transition()
            .attr("stroke-width", "1px")
            .attr("r",5);

            tooltip.transition()
            .duration('200')
            .style("opacity", 0);
        });

    // Add a title to the point (on mouseover)
    enter.append("svg:title")
        .text(function(d){ 
            return "Youtuber: " + d.youtuber + "\n" +
                "Video views: " + d.viewsDays + "\n" +
                "Average earnings: " + d.AverageEarning + "\n"
        });

    //ENTER + UPDATE
    enter.merge(scatter)
        .attr("cx",function(d){ return x(d.AverageEarning); })
        .attr("cy",function(d){ return y(d.viewsDays);});

    xAxis = d3.axisBottom()
        .scale(x);

    yAxis = d3.axisLeft()
        .scale(y);

    var yAxisGroup = canvas.append("g")
        .attr("class","axis")
        .attr("transform","translate(150,0)")
        .call(yAxis);

    yAxisGroup.selectAll("text")
        .attr("transform", "translate(0,0)")

    var xAxisGroup = canvas.append("g")
        .attr("class","axis")
        .attr("transform","translate(0,"+(chartHeight-75)+")")
        .call(xAxis);

    xAxisGroup.selectAll("text")
        .style("text-anchor", "middle")
        .attr("dy", "1em");

    canvas.append("text")
        .attr("class", "x-axis-label")
        .attr("text-anchor", "middle")
        .attr("x", chartWidth / 2 + 60)
        .attr("y", chartHeight - 30)
        .text("Average Monthly Income")
        .attr("font-size", "13px")
        .style("font-weight", "bold");

    canvas.append("text")
        .attr("class", "y-axis-label")
        .attr("text-anchor", "middle")
        .attr("x", 60)
        .attr("y", chartHeight/2 + 35)
        .attr("transform", "rotate(-90 30," + (chartHeight / 2) + ")")
        .text("Video Views for the Last 30 Days")
        .attr("font-size", "13px")
        .style("font-weight", "bold");
    }
