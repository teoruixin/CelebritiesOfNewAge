// var chartWidth = 800;
// var chartHeight = 400;

/******** Data ********/
var allData;
var selectedDate = null;

/******** Load Data ********/
var index = 0;

/******** Scales and Colors ********/
var x, y, color;

/******** Axes ********/
var xAxis;
var yAxis;

const app3 = Vue.createApp({
    data() {
        return {
            chartWidth: 800,
            chartHeight: 400
        }
    },
    methods: {
        /******** Make Chart ********/
        makeChart(data) {
            // Create a color scale for different countries
            color = d3.scaleOrdinal(d3.schemeCategory10);
        
            // Calculate the maximum total count for any Youtuber
            var maxTotalCount = d3.max(data, d => d.countsByCountry.reduce((acc, curr) => acc + curr.count, 0));
        
            // x position
            x = d3.scaleLinear()
            .domain([0, maxTotalCount])
            .nice()
            .range([120, this.chartWidth - 40]);
        
            // y position
            y = d3.scaleBand()
            .domain(data.map(d => d.youtuber))
            .range([20, chartHeight - 25])
            .padding(0.2);
        
            var canvas = d3.select(".chart")
            .attr("width", this.chartWidth + 20)
            .attr("height", chartHeight)
            .attr("transform", "translate(0," + -10 + ")");
        
            // var data = d3.stack()
            //   .keys("country")
            //   (data)
        
            var bars = d3.select(".chart").selectAll("g")
            .data(data);
        
            // ENTER
            var enter = bars.enter().append("g")
            .attr("transform", (d, i) => "translate(0," + y(d.youtuber) + ")");
        
            // YJ's loopy code... try to crack d3.stack()
            var totalCount;
            // loop over rows
            for (row of data) {        // {youtuber: name, countsByCountry: [{country: CA, count: 57}, {country: IN, count: 57}] }
            // Reset starting x
            totalCount = 0;
            // loop over countsByCountry. Draw rectangle, add to starting x
            for (countByCountry of row.countsByCountry) {
                d3.select('.chart')
                .append("rect")
                .attr("fill", color(countByCountry.country))
                .attr("x", x(totalCount))
                .attr("y", y(row.youtuber))
                .attr("width", x(countByCountry.count) - 120)
                .attr("height", y.bandwidth());
        
                totalCount += countByCountry.count;
            }
            }
            // // Add bars for each country
            // enter.selectAll("rect")
            //   .data(d => d.countsByCountry)
            //   .enter()
            //   .append("rect")
            //   .attr("fill", (d) => color(d.country))
            //   .attr("x", 120)
            //   .attr("y", 0)
            //   .attr("width", (d) => x(d.count))
            //   .attr("height", y.bandwidth());
        
            xAxis = d3.axisBottom()
            .scale(x);
        
            yAxis = d3.axisLeft()
            .scale(y);
        
            var yAxisGroup = canvas.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(120,0)")
            .call(yAxis);
        
            yAxisGroup.selectAll("text")
            .attr("transform", "translate(-5,0)")
            .style("text-anchor", "end");
        
            yAxisGroup.append("text")
            .text("Youtuber")
            .attr("y", 17)
            .attr("dx", -10)
            .style("text-anchor", "end")
            .style("font-weight", "bold");
        
            canvas.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + (chartHeight - 25) + ")")
            .call(xAxis)
            .append("text")
            .text("Count")
            .attr("x", this.chartWidth - 5)
            .attr("dy", -5)
            .style("text-anchor", "end")
            .style("fill", "black")
            .style("font-weight", "bold");
        },

        // Update the chart with filtered data based on the selected date
        updateChart() {
            var filteredData = allData.filter(d => d.date === selectedDate);
            this.makeChart(filteredData);
        },

        /******** Create Legends ********/
        createLegends(data) {
            var legend = d3.select(".legend");

            data[0].countsByCountry.forEach(function (d) {
            var legendItem = legend.append("div").attr("class", "legend-item");
            legendItem
                .append("div")
                .attr("class", "legend-color")
                .style("background-color", color(d.country));
            legendItem
                .append("div")
                .text(d.country)
                .style("font-size", "12px");
            });
        }


    },

    created() {
        d3.csv("data/merged.csv", (row, i) => {
            return {
            date: row.month,
            youtuber: row.channel_title,
            count: +row.count,
            country: row.country
            };
        }).then(rows => {
            // filter out the "nan" category
            rows = rows.filter(row => row.category !== "nan");
        
            // Create a list of unique dates
            var uniqueDates = [...new Set(rows.map(row => row.date))];
        
            // Populate the date filter dropdown with unique dates
            var dateFilter = d3.select("#date-filter");
            dateFilter
            .selectAll("option")
            .data(uniqueDates)
            .enter()
            .append("option")
            .text(d => d)
            .attr("value", d => d);
        
            // Attach an event handler to the dropdown
            dateFilter.on("change", function () {
            selectedDate = this.value; // Update selectedDate when a new date is selected
            this.updateChart();
            });
        
            // calculate counts for each youtuber
            var youtuberCounts = d3.rollup(
            rows,
            v => d3.sum(v, d => d.count),
            d => d.youtuber,
            d => d.country
            );
        
            var data = Array.from(youtuberCounts, ([youtuber, countsByCountry]) => ({
            youtuber,
            countsByCountry: Array.from(countsByCountry, ([country, count]) => ({
                country,
                count
            }))
            }));
        
            // sort the data by total count in descending order
            data.sort((a, b) => {
            let sumA = a.countsByCountry.reduce((acc, curr) => acc + curr.count, 0);
            let sumB = b.countsByCountry.reduce((acc, curr) => acc + curr.count, 0);
            return sumB - sumA;
            });
        
            // Get only the top 20 Youtubers
            data = data.slice(0, 20);
        
            allData = data;
            this.makeChart(data);
            this.createLegends(data);
        }).catch(error => {
            console.log(error);
        });
    }

})
app3.mount("#app3")



/******** Create Legends ********/
function createLegends(data) {
    var legend = d3.select(".legend");

    data[0].countsByCountry.forEach(function (d) {
    var legendItem = legend.append("div").attr("class", "legend-item");
    legendItem
        .append("div")
        .attr("class", "legend-color")
        .style("background-color", color(d.country));
    legendItem
        .append("div")
        .text(d.country)
        .style("font-size", "12px");
    });
}