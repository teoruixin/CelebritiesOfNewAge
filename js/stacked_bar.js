// var chartWidth = 800;
// var chartHeight = 400;

/******** Data ********/
var allData;

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
            countryColorMap: { "CA": null, "DE": null, "FR": null, "GB": null, "IN": null, "JP": null, "MX": null, "US": null, "RU": null, "KR": null },
            chartWidth: 1000,
            chartHeight: 400,
            marginTop: 10,
            marginRight: 25,
            marginBottom: 20,
            marginLeft: 120,
            selectedDate: null,
            curData: null,
            allData: null,
            xAxis: null,
            yAxis: null,
        }
    },
    methods: {
        /******** Make Chart ********/
        makeChart(date) {
            // Get data
            let data = this.allData.get(date);
            this.curData = data;

            // Calculate the maximum total count for any Youtuber
            var maxTotalCount = d3.max(data, d => d.countsByCountry.reduce((acc, curr) => acc + curr.count, 0));

            // x position
            x = d3.scaleLinear()
                .domain([0, maxTotalCount])
                .nice()
                .range([this.marginLeft, this.chartWidth - 20]);

            // y position
            y = d3.scaleBand()
                .domain(data.map(d => d.youtuber))
                .range([this.marginBottom, this.chartHeight - 25])
                .padding(0.2);

            var canvas = d3.select(".chart")
                .attr("width", this.chartWidth + 200)
                .attr("height", this.chartHeight)
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
                        .attr("fill", this.countryColorMap[countByCountry.country])
                        .attr("x", x(totalCount))
                        .attr("y", y(row.youtuber))
                        .attr("width", x(countByCountry.count) - this.marginLeft)
                        .attr("height", y.bandwidth());

                    totalCount += countByCountry.count;
                }
            }

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

            var xAxisGroup = canvas.append("g")
                .attr("class", "axis")
                .attr("transform", "translate(0," + (this.chartHeight - 25) + ")")
                .call(xAxis)
                .append("text")
                .text("Count")
                .attr("x", this.chartWidth - 5)
                .attr("dy", -5)
                .style("text-anchor", "end")
                .style("fill", "black")
                .style("font-weight", "bold");

            this.xAxis = xAxisGroup;
            this.yAxis = yAxisGroup;

            // Add a legend
            const legend = canvas.append("g")
            .attr("transform", `translate(${this.chartWidth +10}, 10)`);

            // Create a legend title
            legend.append("text")
                .text("Country")
                .attr("dy", "0.35em")
                .attr("font-weight", "bold")
                .attr("font-size", "14px");

            // Create legend items

            var countries = [];
            for (let [country, count] of Object.entries(this.countryColorMap)) {
                countries.push({country: country, count: count})
            }
            
            // const countries = data[1].countsByCountry
            // console.log(countries) // [{ country: "CA", count: 15 }]
            countries.forEach((country, index) => {
                const legendItem = legend.append("g")
                    .attr("transform", `translate(0, ${index * 13 + 20})`);

                legendItem.append("circle")
                    .attr("r", 4)
                    .attr("fill", color(country.country));

                legendItem.append("text")
                    .text(country.country)
                    .attr("x", 10)
                    .attr("dy", "0.32em")
                    .attr("font-size", "12px");
            });
        },

        // Update the chart with filtered data based on the selected date
        updateChart(date) {
            const transition_time = 1000;
            var data = this.allData.get(date);

            // Calculate the maximum total count for any Youtuber
            var maxTotalCount = d3.max(data, d => d.countsByCountry.reduce((acc, curr) => acc + curr.count, 0));

            // x position
            x = d3.scaleLinear()
                .domain([0, maxTotalCount])
                .nice()
                .range([this.marginLeft, this.chartWidth - this.marginRight]);

            var oldX = d3.scaleLinear()
                .domain([0, d3.max(this.curData, d => d.countsByCountry.reduce((acc, curr) => acc + curr.count, 0))])
                .nice()
                .range([this.marginLeft, this.chartWidth - this.marginRight]);

            // y position
            y = d3.scaleBand()
                .domain(data.map(d => d.youtuber))
                .range([20, this.chartHeight - 25])
                .padding(0.2);

            var oldY = d3.scaleBand()
                .domain(this.curData.map(d => d.youtuber))
                .range([20, this.chartHeight - 25])
                .padding(0.2);

            // update axes
            this.xAxis.transition().duration(transition_time).call(
                d3.axisBottom()
                    .scale(x)
                    .tickFormat(d => (d / 1000000).toFixed(2) + "M")
            );

            this.yAxis.transition().duration(transition_time).call(
                d3.axisLeft()
                    .scale(y)
            );

            // curData is current chart data;       data is new data
            // format of data is an array of objects:
            // [ {youtuber: name, countsByCountry: [{country: CA, count: 57}, {country: IN, count: 57}] },
            //   {youtuber: name, countsByCountry: [{country: CA, count: 57}] } ]
            // need to sort to new, update, remove
            let toAdd = new Map;
            let toUpd = new Map;
            let toRem = new Map;
            let oldList = [];
            let oldListFixed = [];
            let oldListChannels = [];

            // get all old channel names
            for (let channel of this.curData) {
                oldList.push(channel.youtuber);
                oldListFixed.push(channel.youtuber);
                oldListChannels.push(channel)
            }

            // sort data into toAdd and toUpd
            let oldIdx;
            for (let [idx, channel] of data.entries()) {
                oldIdx = oldList.indexOf(channel.youtuber)
                if (oldIdx >= 0) {
                    // add old index to channel
                    channel["oldIdx"] = oldListFixed.indexOf(channel.youtuber)
                    channel["oldData"] = oldListChannels[channel.oldIdx]
                    // add toUpd and remove from oldList
                    toUpd.set(key = idx, value = channel)
                    oldList.splice(oldIdx, 1);
                    continue;
                }
                toAdd.set(key = idx, value = channel)
                continue;
            }

            // sort channels into toRem
            for (let [idx, channel] of this.curData.entries()) {
                if (oldList.indexOf(channel.youtuber) >= 0) {
                    toRem.set(key = idx, value = channel)
                }
            }

            d3.select('.chart')
                .selectAll("rect")
                // .transition(0.05)
                .remove();

            // add rows
            let totalCount = 0;
            for (let [newIdx, row] of toAdd) {        // {youtuber: name, countsByCountry: [{country: CA, count: 57}, {country: IN, count: 57}] }
                // Reset starting x
                totalCount = 0;
                // loop over countsByCountry. Draw rectangle, add to starting x
                for (countByCountry of row.countsByCountry) {
                    d3.select('.chart')
                        .append("rect")
                        .attr("fill", this.countryColorMap[countByCountry.country])
                        .attr("x", x(totalCount))
                        // .attr("y", y(row.youtuber))
                        .attr("y", this.chartHeight)
                        .attr("width", x(countByCountry.count) - this.marginLeft)
                        .attr("height", y.bandwidth())
                        .attr("opacity", 0)
                        .transition()
                        .duration(transition_time)
                        .attr("y", y(row.youtuber))
                        .attr("opacity", 1);

                    totalCount += countByCountry.count;
                }
            }

            // update rows
            totalCount = 0;
            let totalCountOld = 0;
            let totalCountNew = 0;
            let oldCount = 0;
            let oldCountryIdx = 0
            let curCountry = null;
            let curCountryList;
            let oldCountryList;
            let idx;
            for (let [newIdx, row] of toUpd) {        // {youtuber: name, countsByCountry: [{country: CA, count: 57}, {country: IN, count: 57}] }
                // Reset starting x
                totalCountOld = 0;
                totalCountNew = 0;
                idx = 0;
                // find and insert zeroes into row.countsByCountry
                curCountryList = row.countsByCountry;
                oldCountryList = row.oldData.countsByCountry;
                for (let oldCountry of oldCountryList) {
                    oldCountryIdx = curCountryList.findIndex(e => e.country === oldCountry.country);
                    if (oldCountryIdx < 0) {
                        curCountryList.splice(idx, 0, { country: oldCountry.country, count: 0 })
                    }
                    idx++;
                }
                // loop over countsByCountry. Draw rectangle, add to starting x
                for (countByCountry of curCountryList) {
                    // set current country
                    curCountry = countByCountry.country;
                    oldCountryIdx = oldCountryList.findIndex(e => e.country === curCountry);
                    if (oldCountryIdx >= 0) {
                        oldCount = oldCountryList[oldCountryIdx].count
                    } else {
                        oldCount = 0;
                    }
                    // generate old chart
                    d3.select('.chart')
                        .append("rect")
                        .attr("fill", this.countryColorMap[curCountry])
                        .attr("x", oldX(totalCountOld))
                        .attr("y", oldY(row.youtuber))
                        .attr("width", oldX(oldCount) - this.marginLeft)
                        .attr("height", y.bandwidth())
                        .attr("opacity", 1)
                        // transition to new chart
                        .transition()
                        .duration(transition_time)
                        .attr("x", x(totalCountNew))
                        .attr("y", y(row.youtuber))
                        .attr("width", x(countByCountry.count) - this.marginLeft)
                        .attr("opacity", 1);

                    totalCountNew += countByCountry.count;
                    totalCountOld += oldCount
                }
            }

            // remove rows
            totalCount = 0;
            for (let [newIdx, row] of toRem) {        // {youtuber: name, countsByCountry: [{country: CA, count: 57}, {country: IN, count: 57}] }
                // Reset starting x
                totalCount = 0;
                // loop over countsByCountry. Draw rectangle, add to starting x
                for (countByCountry of row.countsByCountry) {
                    d3.select('.chart')
                        .append("rect")
                        .attr("fill", this.countryColorMap[countByCountry.country])
                        .attr("x", oldX(totalCount))
                        .attr("y", oldY(row.youtuber))
                        // .attr("y", this.chartHeight)
                        .attr("width", oldX(countByCountry.count) - this.marginLeft)
                        .attr("height", y.bandwidth())
                        .attr("opacity", 1)
                        // transition away
                        .transition()
                        .duration(transition_time)
                        .attr("opacity", 0);

                    totalCount += countByCountry.count;
                }
            }

            // Update this.curData
            this.curData = data;
        },

        /******** Create Legends ********/
        createLegends() {
            var legend = d3.select(".legend");

            legend.append("text")
                .text("Country")
                .attr("dy", "0.35em")
                .attr("font-weight", "bold")
                .attr("font-size", "14px");
                
            // var countryList = [];
            var legendItem;
            for (let [key, val] of Object.entries(this.countryColorMap)) {
                legendItem = legend.append("div").attr("class", "legend-item");
                legendItem.append("svg")
                    .attr("width", 10)
                    .attr("height", 15)
                    .attr("class", "legend-color")
                    .append("circle")
                    .attr("cx", 5)
                    .attr("cy", 8.5)
                    .attr("r", 5)
                    .attr("fill", val);

                legendItem
                    .append("div")
                    .text(key)
                    .style("font-size", "12px");
            }
        },
    },

    created() {
        color = d3.scaleOrdinal(d3.schemePaired);
        for (let [c, val] of Object.entries(this.countryColorMap)) {
            this.countryColorMap[c] = color(c)
        }

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
                stacked_bar.selectedDate = this.value; // Update selectedDate when a new date is selected
                stacked_bar.updateChart(this.value);
            });

            var groupedData = d3.group(rows, d => d.date);

            this.allData = new Map();

            // Calculate counts for each youtuber by date
            groupedData.forEach((trendData, date) => {
                var youtuberCounts = d3.rollup(
                    trendData,
                    v => d3.sum(v, d => d.count),
                    d => d.youtuber,
                    d => d.country
                );

                var toSave = Array.from(youtuberCounts, ([youtuber, countsByCountry]) => ({
                    youtuber,
                    countsByCountry: Array.from(countsByCountry, ([country, count]) => ({
                        country,
                        count
                    }))
                }));

                toSave.sort((a, b) => {
                    let sumA = a.countsByCountry.reduce((acc, curr) => acc + curr.count, 0);
                    let sumB = b.countsByCountry.reduce((acc, curr) => acc + curr.count, 0);
                    return sumB - sumA;
                });

                toSave = toSave.slice(0, 20);
                this.allData.set(date, toSave);
            });

            this.makeChart(date = "2017-11");
            // this.createLegends();
        }).catch(error => {
            console.log(error);
        });
    }

})
const stacked_bar = app3.mount("#app3")
