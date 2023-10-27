// Define colors for each country
var countryColors = d3.scaleOrdinal(d3.schemeCategory10);
var allData;
/******** Load Data ********/
d3.csv("../data/Global YouTube Statistics.csv", (row, i) => {
    return {
        youtuber: row.Youtuber,
        subscribers: +row.subscribers,
        country: row.Country
    };
}).then(rows => {
    // Filter out "nan" country
    rows = rows.filter(row => row.country && row.country.toLowerCase() !== "nan");

    // Group data by country
    var groupedData = d3.group(rows, d => d.country);

    // Calculate total subscribers for each country
    var countrySubscribers = new Map();
    groupedData.forEach((group, country) => {
        var totalSubscribers = d3.sum(group, d => d.subscribers);
        countrySubscribers.set(country, totalSubscribers);
    });

    // Sort countries by total subscribers in descending order
    var topCountries = Array.from(countrySubscribers)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5); // Select the top 5 countries

    // Assign colors to the top countries
    topCountries.forEach((country, i) => {
        country[1] = i;
        country[2] = countryColors(i);
    });

    // Display the legend
    var legend = d3.select(".legend").selectAll(".legend-entry")
        .data(topCountries)
        .enter()
        .append("div")
        .attr("class", "legend-entry");

    legend.append("div")
        .attr("class", "legend-color")
        .style("background-color", (d) => d[2]);

    legend.append("div")
        .attr("class", "legend-text")
        .text((d) => d[0]);

    // Extract the top 5 YouTubers for each of the top countries
    var topYoutubers = [];
    topCountries.forEach(([country, totalSubscribers, color]) => {
        var countryYoutubers = groupedData.get(country);
        countryYoutubers.sort((a, b) => b.subscribers - a.subscribers);
        countryYoutubers.forEach(youtuber => youtuber.color = color);
        topYoutubers.push(...countryYoutubers.slice(0, 5));
    });

    allData = topYoutubers;
    top_channels_make(topYoutubers);
}).catch(error => {
    console.log(error);
});

/******** Make Chart ********/
function top_channels_make(data) {
    
    // Declare the chart dimensions and margins.
    const width = 1080;
    const height = 400;
    const marginTop = 20;
    const marginRight = 20;
    const marginBottom = 30;
    const marginLeft = 100;

    // x position
    var x = d3.scaleLinear()
        .domain([0, d3.max(data, function (d) { return d.subscribers; })])
        .nice()
        .range([marginLeft, width - marginRight]);

    // y position
    var y = d3.scaleBand()
        .domain(data.map(d => d.youtuber))
        .range([marginTop, height - marginBottom])
        .padding(0.2);

    var canvas = d3.select(".chart")
        .attr("width", width)
        .attr("height", height);
        // .attr("transform", "translate(0," + -10 + ")");

    var bars = d3.select(".chart").selectAll("rect")
        .data(data);

    // ENTER
    var enter = bars.enter().append("rect")
        .attr("x", marginLeft)
        .attr("y", (d) => y(d.youtuber))
        .attr("width", (d) => x(d.subscribers) - marginLeft)
        .attr("height", y.bandwidth())
        .attr("fill", (d) => d.color); // Assign the color based on the country

    // ENTER + UPDATE
    enter.merge(bars)
        .attr("x", marginLeft)
        .attr("y", (d) => y(d.youtuber))
        .attr("width", (d) => x(d.subscribers) - marginLeft)
        .attr("height", y.bandwidth());

    // Add the x axis
    var xAxis = d3.axisBottom()
        .scale(x)
        .tickFormat(d => (d / 1000000).toFixed(2) + "M"); // Display subscribers in millions

    canvas.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + (height - marginBottom) + ")")
        .call(xAxis)
        .append("text")
        .text("Subscribers")
        .attr("x", width - 30)
        .attr("dy", -5)
        .style("text-anchor", "end")
        .style("fill", "black")
        .style("font-weight", "bold");

    var yAxis = d3.axisLeft()
        .scale(y);

    var yAxisGroup = canvas.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(${marginLeft},0)`)
        .call(yAxis);

    yAxisGroup.selectAll("text")
        .attr("transform", "translate(0,0)")
        .style("text-anchor", "end");

    yAxisGroup.append("text")
        .text("Youtuber")
        .attr("y", 17)
        .attr("dx", -10)
        .style("text-anchor", "end")
        .style("font-weight", "bold");

    // Add count labels to the bars
    canvas.selectAll(".count-label")
        .data(data)
        .enter()
        .append("text")
        .attr("class", "count-label")
        .attr("x", (d) => x(d.subscribers) + 5)
        .attr("y", (d) => y(d.youtuber) + y.bandwidth() / 2 + 5)
        .text((d) => (d.subscribers / 1000000).toFixed(2) + "M") // Display subscribers in millions
        .style("font-size", "12px")
        .style("fill", "black")
        .style("text-anchor", "start");
}