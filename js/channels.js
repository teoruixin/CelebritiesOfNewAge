// Vue Application for "channels.html"

const app = Vue.createApp({
    data() {
        return {
            countryColorMap: {"Canada": null, "Germany": null, "France": null, "United Kingdom": null, "India": null, "Japan": null, "Mexico": null, "United States": null, "Russia": null, "South Korea": null, "Brazil": null, "Others": null},
            legendColorMap: [], // extraCountryColorMap: {"Brazil", "Indonesia", "Spain", "Thailand", "Argentina", "Colombia", "Others"]},
            data: [],               // Stores all data
            data_top: [],           // Stores top youtuber data
            xAxis: null,
            yAxis: null,
            criteria: {             // Stores filter criteria
                country: [],
                category: [],
            },
            barChart: null,         // Stores the bar chart object
            barChart_dim: {         // Stores dimensions of bar chart 
                width: 700,
                height: 400,
                marginTop: 10,
                marginRight: 25,
                marginBottom: 20,
                marginLeft: 150,
            },
            treemap_dim: {          // Stores dimensions of treemap
                width: 600,
                height: 400,
                marginTop: 10,
                marginRight: 10,
                marginBottom: 10,
                marginLeft: 10
            },
            cur_treemap: "Countries"
        }
    }, // /data
    methods: {
        popup(toHide) {     // contains this.top_channels_update
            if (toHide) {
                document.getElementById("popup_bg").style.display = "none";
                this.top_channels_update();
                return
            }
            document.getElementById("popup_bg").style.display = "block";
            return
        },
        change_treemap() {     // contains this.top_channels_update
            var target = this.cur_treemap == "Countries" ? "category" : "country"
            if (target == "country") {
                document.getElementById("treemap_categories").style.display = "none";
                document.getElementById("treemap_countries").style.display = "block";
                this.cur_treemap = "Countries";
                return
            }
            document.getElementById("treemap_countries").style.display = "none";
            document.getElementById("treemap_categories").style.display = "block";
            this.cur_treemap = "Categories";
            return
        },
        rm_from_list(target, idx, delay) {
            this.criteria[target].splice(idx, 1);
            if (delay) {
                return;
            }
            this.top_channels_update();
        },
        top_channels_filter() {
            // Define number of channels to display
            const top_n = 20;
            const hasCountryCrit = this.criteria.country.length > 0;
            const hasCategoryCrit = this.criteria.category.length > 0;

            this.data_top = this.data;

            if (hasCountryCrit) {
                this.data_top = this.data_top.filter(row => this.criteria.country.indexOf(row.country) >= 0);
            }
            if (hasCategoryCrit) {
                this.data_top = this.data_top.filter(row => this.criteria.category.indexOf(row.category) >= 0);
            }

            this.data_top = this.data_top.slice(0, top_n);

            return;
        }, // top_channels_filter

        generate_legend() {
            // Update legend data:
            // Get countries that appear in the top 20
            var countries = [];
            for (var row of this.data_top) {
                if (countries.indexOf(row.country) == -1) {
                    countries.push(row.country);
                }
            }

            // Generate legend data for top 20 countries
            var legend_data_top = this.legendColorMap.filter(entry => countries.indexOf(entry[0]) != -1 || entry[0] == "Others")

            d3.select(".legend").text("Countries").style("font-weight", "bold");

            // // Display the legend
            var legend = d3.select(".legend")
                .selectAll(".legend-entry")
                .data(legend_data_top, d => d[0])
                .enter()
                .append("div")
                .attr("class", "legend-entry");

            legend.append("svg")
                .attr("width", 15)
                .attr("height", 10)
                .attr("class", "legend-color")
                .append("circle")
                .attr("cx", 5)
                .attr("cy", 5)
                .attr("r", 5)
                .attr("fill", (d) => d[1]);

            legend.append("span")
                .attr("class", "legend-text")
                .style("font-weight", "normal")
                .text((d) => d[0]);
        }, // generate_legend

        update_legend() {
            // brute force
            d3.select(".legend").selectAll(".legend-entry").remove();
            this.generate_legend();
        }, // update_legend

        top_channels_create(data) {
            // Declare the chart dimensions and margins.
            const width = this.barChart_dim.width;
            const height = this.barChart_dim.height;
            const marginTop = this.barChart_dim.marginTop;
            const marginRight = this.barChart_dim.marginRight;
            const marginBottom = this.barChart_dim.marginBottom;
            const marginLeft = this.barChart_dim.marginLeft;

            // Declare x scale
            var x = d3.scaleLinear()
                .domain([0, d3.max(data, function (d) { return d.subscribers; })])
                .nice()
                .range([marginLeft, width - marginRight]);

            // Declare y scale
            var y = d3.scaleBand()
                .domain(data.map(d => d.youtuber))
                .range([marginTop, height - marginBottom])
                .padding(0.2);

            var graph = d3.create("svg")
                .attr("id", "top_youtubers_chart")
                .attr("width", width)
                .attr("height", height);
            // .attr("transform", "translate(0," + -10 + ")");

            var bars = graph.selectAll("rect")
                .data(data, d => d.youtuber);

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

            var xAxisGroup = graph.append("g")
                .attr("class", "axis")
                .attr("transform", "translate(0," + (height - marginBottom) + ")")
                .call(xAxis);

            xAxisGroup.append("text")
                .text("Subscribers")
                .attr("x", width - 30)
                .attr("dy", -5)
                .style("text-anchor", "end")
                .style("fill", "black")
                .style("font-weight", "bold");

            var yAxis = d3.axisLeft()
                .scale(y);

            var yAxisGroup = graph.append("g")
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
            graph.selectAll(".count-label")
                .data(data, d => d.youtuber)
                .enter()
                .append("text")
                .attr("class", "count-label")
                .attr("x", (d) => x(d.subscribers) <= width - 50 ? x(d.subscribers) + 5 : x(d.subscribers) - 50)
                .attr("y", (d) => y(d.youtuber) + y.bandwidth() / 2 + 5)
                .text((d) => (d.subscribers / 1000000).toFixed(2) + "M") // Display subscribers in millions
                .style("font-size", "12px")
                .style("fill", "black")
                .style("text-anchor", "start");

            // Append SVG to div
            top_youtubers_div.append(graph.node());

            // Save graph to Vue
            this.barChart = graph;
            this.xAxis = xAxisGroup;
            this.yAxis = yAxisGroup;
        }, // top_channels_create

        top_channels_update() {
            // Declare chart dimensions.
            const width = this.barChart_dim.width;
            const height = this.barChart_dim.height;
            const marginTop = this.barChart_dim.marginTop;
            const marginRight = this.barChart_dim.marginRight;
            const marginBottom = this.barChart_dim.marginBottom;
            const marginLeft = this.barChart_dim.marginLeft;

            // Declare transition duration
            const transition_time = 750;

            // New data for updating the chart.
            this.top_channels_filter();

            // Update legend.
            this.update_legend();

            // Declare x scale
            var x = d3.scaleLinear()
                .domain([0, d3.max(this.data_top, function (d) { return d.subscribers; })])
                .nice()
                .range([marginLeft, width - marginRight]);

            // Declare y scale
            var y = d3.scaleBand()
                .domain(this.data_top.map(d => d.youtuber))
                .range([marginTop, height - marginBottom])
                .padding(0.2);

            // Update bar chart
            this.barChart               // this.barChart is an svg (cf. variable "graph" in create)
                .selectAll('rect')
                // declare data, key
                .data(this.data_top, d => d.youtuber)
                .join(
                    // enter: new data
                    enter => enter.append('rect')
                        // declare initial position
                        .attr("x", marginLeft)
                        .attr("y", height - marginBottom) // (d) => y(d.youtuber))
                        .attr("width", (d) => x(d.subscribers) - marginLeft)
                        .attr("height", y.bandwidth())
                        .attr("fill", (d) => d.color)
                        .attr("opacity", 0)
                        // transition to final position
                        .transition()
                        .duration(transition_time)
                        .attr("y", (d) => y(d.youtuber))
                        .attr('opacity', 1),

                    update => update
                        // Declare transition to final position
                        .transition()
                        .duration(transition_time)
                        // .attr("x", marginLeft)
                        .attr("y", (d) => y(d.youtuber))
                        .attr("width", (d) => x(d.subscribers) - marginLeft)
                        .attr("height", y.bandwidth()),

                    exit => exit
                        // Declare transition to final position
                        .transition()
                        .duration(transition_time)
                        .attr("y", height - marginBottom) // (d) => y(d.youtuber))
                        .attr('opacity', 0)
                        // then remove().
                        .remove()
                );

            this.barChart
                .selectAll(".count-label")
                .data(this.data_top, d => d.youtuber)
                .join(
                    enter => enter
                        .append("text")
                        .attr("class", "count-label")
                        .attr("x", (d) => x(d.subscribers) <= width - 50 ? x(d.subscribers) + 5 : x(d.subscribers) - 50)
                        // .attr("x", (d) => x(d.subscribers) + 5)
                        .attr("y", height - marginBottom)
                        .text((d) => (d.subscribers / 1000000).toFixed(2) + "M") // Display subscribers in millions
                        .style("font-size", "12px")
                        .style("fill", "black")
                        .style("text-anchor", "start")
                        .attr("opacity", 0)
                        .transition()
                        .duration(transition_time)
                        .attr("y", (d) => y(d.youtuber) + y.bandwidth() / 2 + 5)
                        .attr('opacity', 1),

                    update => update
                        // Declare transition to final position
                        .transition()
                        .duration(transition_time)
                        .attr("x", (d) => x(d.subscribers) <= width - 50 ? x(d.subscribers) + 5 : x(d.subscribers) - 50)
                        .attr("y", (d) => y(d.youtuber) + y.bandwidth() / 2 + 5),

                    exit => exit
                        // Declare transition to final position
                        .transition()
                        .duration(transition_time)
                        .attr("y", height - marginBottom) // (d) => y(d.youtuber))
                        .attr('opacity', 0)
                        // then remove().
                        .remove()
                )

            this.xAxis.transition().duration(transition_time).call(
                d3.axisBottom()
                    .scale(x)
                    .tickFormat(d => (d / 1000000).toFixed(2) + "M")
            );

            this.yAxis.transition().duration(transition_time).call(
                d3.axisLeft()
                    .scale(y)
            );
        }, // top_channels_update

        treemap_countYoutubers(data, target) {
            // Helper function used to count number of Youtubers in target (country, category)
            // Output: [{country: India, value: 168}, {country: Brazil, value: 90}, ...] (or category)
            var youtuberCount = {};
            for (var row of data) {
                if (row[target] == "nan") {
                    continue;
                }
                if (row[target] in youtuberCount) {
                    youtuberCount[row[target]]["value"] += 1
                }
                else {
                    youtuberCount[row[target]] = {};
                    youtuberCount[row[target]][target] = row[target];
                    youtuberCount[row[target]]["value"] = 1;
                    // {country: India, value: 168} or {category: Music, value: 169}
                }
            }

            var output = [];
            for (var tgt in youtuberCount) {
                output.push(youtuberCount[tgt]);
            }
            return output;
        }, // treemap_countYoutubers

        treemap_onClick(event, d) {
            // Check which treemap was clicked (country/category). 
            // Then check if clicked country/category is in criteria. 
            // If yes, remove. If no, add. 
            // Then update Top Youtubers graph.
            if ("country" in d.data) {
                var tgtIndex = this.criteria.country.indexOf(d.data.country);
                if (tgtIndex >= 0) {
                    this.criteria.country.splice(tgtIndex, 1);
                    return;
                }
                this.criteria.country.push(d.data.country);
                return;
            }
            if ("category" in d.data) {
                var tgtIndex = this.criteria.category.indexOf(d.data.category);
                if (tgtIndex >= 0) {
                    this.criteria.category.splice(tgtIndex, 1);
                    return;
                }
                this.criteria.category.push(d.data.category);
                return;
            }
        }, // treemap_onclick(event, d)

        treemap_countries_create(input_data) {
            // Declare the chart dimensions and margins.
            const width = this.treemap_dim.width;
            const height = this.treemap_dim.height;
            const marginTop = this.treemap_dim.marginTop;
            const marginRight = this.treemap_dim.marginRight;
            const marginBottom = this.treemap_dim.marginBottom;
            const marginLeft = this.treemap_dim.marginLeft;

            var countriesYoutubers = this.treemap_countYoutubers(input_data, "country")

            var data = {
                "name": "Youtubers By Countries",
                "children": countriesYoutubers
            };

            // Create the SVG container, here named "graph". Specify size in width and height above ^
            const graph = d3.select("#treemap_countries")
                .append("svg")
                .attr("width", width + marginLeft + marginRight)
                .attr("height", height + marginTop + marginBottom)
                .append("g")
                .attr("transform",
                    "translate(" + marginLeft + "," + marginTop + ")");

            const color = d3.scaleOrdinal(['#67000d', '#71020e', '#7a0510', '#840711', '#8d0912', '#960b13', '#9e0d15', '#a60f16', '#ad1117', '#b41318', '#ba151a', '#c0171b', '#c61a1d', '#cc1d1f', '#d22121', '#d72623', '#dd2b25', '#e23028', '#e6362b', '#eb3c2e', '#ee4332', '#f14936', '#f4503a', '#f6573f', '#f75e44', '#f96549', '#fa6c4e', '#fa7354', '#fb795a', '#fb8060', '#fc8667', '#fc8d6d', '#fc9374', '#fc997b', '#fca082', '#fca689', '#fcac91', '#fcb398', '#fcb99f', '#fcbfa7', '#fdc5af', '#fdcbb6', '#fdd0bd', '#fdd5c4', '#fedacb', '#fedfd1', '#fee3d7', '#fee7dc', '#ffebe2', '#ffeee6', '#fff2eb', '#fff5f0'])

            // Give the data to this cluster layout:
            var root = d3.hierarchy(data).sum(d => d.value).sort((a, b) => b.value - a.value) // Here the size of each leave is given in the 'value' field in input data

            // Then d3.treemap computes the position of each element of the hierarchy
            var treemap = d3.treemap()
                .size([width, height])
                .padding(2)
                (root)

            let treemapArray = treemap.descendants().filter(d => d.depth == 1);

            //tooltip
            var tooltip = d3.select("#treemap_countries")
                .append("div")
                .style("opacity", 0)
                .attr("class", "tooltip")
                .style("background-color", "white")
                .style("border", "solid")
                .style("border-width", "2px")
                .style("border-radius", "5px")
                .style("padding", "5px")
                .style("position", "absolute")

            // Three function that change the tooltip when user hover / move / leave a cell
            const mouseover = function (event, d) {
                tooltip
                    .style("opacity", 1)
                d3.select(this)
                    .style("stroke", "black")
                    .style("stroke-width", 2)
                    .style("opacity", 1)
            }
            const mousemove = function (event, d) {
                tooltip
                    .html("<strong>" + "Country: " + "</strong>" + d.data.country + "<br>" +
                        "<strong>" + "Youtuber count: " + "</strong>" + d.value)
                    .style("left", event.x + 10 + "px")
                    .style("top", event.y + 10 + "px")
            }
            const mouseleave = function (event, d) {
                tooltip
                    .style("opacity", 0)
                d3.select(this)
                    .style("stroke", "none")
            }

            // use this information to add rectangles:
            var enter = graph
                .selectAll("rect")
                .data(treemapArray)
                .enter()
                .append("rect")
                .attr('x', d => d.x0)
                .attr('y', d => d.y0)
                .attr('width', d => (d.x1 - d.x0))
                .attr('height', d => (d.y1 - d.y0))
                .style("stroke", "black")
                .style("fill", color)
                .on("mouseover", mouseover)
                .on("mousemove", mousemove)
                .on("mouseleave", mouseleave)
                .on("click", this.treemap_onClick);

            // and to add the text labels
            graph
                .selectAll("text")
                .data(treemapArray)
                .enter()
                .append("text")
                .selectAll('tspan')
                .data(d => {
                    return d.value > 20 ? d.data.country.split(/(?=[A-Z][^A-Z])/g) // split the name of movie
                        .map(v => {
                            return {
                                text: v,
                                x0: d.x0,                        // keep x0 reference
                                y0: d.y0                         // keep y0 reference
                            }
                        }) : ""
                })
                .enter()
                .append('tspan')
                .attr("x", d => (d.x0 + 5))  // +10 to adjust position (more right)
                .attr("y", (d, i) => (d.y0 + 20 + (i * 15)))    // +20 to adjust position (lower)
                .text(d => d.text)
                .attr("font-size", "15px")
                .attr("fill", "white")
        }, // treemap_countries_create

        treemap_categories_create(input_data) {
            // Declare the chart dimensions and margins.
            const width = this.treemap_dim.width;
            const height = this.treemap_dim.height;
            const marginTop = this.treemap_dim.marginTop;
            const marginRight = this.treemap_dim.marginRight;
            const marginBottom = this.treemap_dim.marginBottom;
            const marginLeft = this.treemap_dim.marginLeft;

            var categoriesYoutubers = this.treemap_countYoutubers(input_data, "category")

            var data = {
                "name": "Youtubers By Categories",
                "children": categoriesYoutubers
            };

            // Create the SVG container, here named "graph". Specify size in width and height above ^
            const graph = d3.select("#treemap_categories")
                .append("svg")
                .attr("width", width + marginLeft + marginRight)
                .attr("height", height + marginTop + marginBottom)
                .append("g")
                .attr("transform",
                    "translate(" + marginLeft + "," + marginTop + ")");

            const color = d3.scaleOrdinal(['#67000d', '#7a0510', '#8d0912', '#9e0d15', '#ad1117', '#ba151a', '#c61a1d', '#d22121', '#dd2b25', '#e6362b', '#ee4332', '#f4503a', '#f75e44', '#fa6c4e', '#fb795a', '#fc8667', '#fc9374', '#fca082', '#fcac91', '#fcb99f', '#fdc5af', '#fdd0bd', '#fedacb', '#fee3d7', '#ffebe2', '#fff2eb']);

            // Give the data to this cluster layout:
            var root = d3.hierarchy(data).sum(d => d.value).sort((a, b) => b.value - a.value) // Here the size of each leave is given in the 'value' field in input data

            // Then d3.treemap computes the position of each element of the hierarchy
            var treemap = d3.treemap()
                .size([width, height])
                .padding(2)
                (root)

            let parentArray = treemap.descendants().filter(d => d.depth == 1)

            //tooltip
            var tooltip = d3.select("#treemap_categories")
                .append("div")
                .style("opacity", 0)
                .attr("class", "tooltip")
                .style("background-color", "white")
                .style("border", "solid")
                .style("border-width", "2px")
                .style("border-radius", "5px")
                .style("padding", "5px")
                .style("position", "absolute")

            // Three function that change the tooltip when user hover / move / leave a cell
            const mouseover = function (event, d) {
                tooltip
                    .style("opacity", 1)
                d3.select(this)
                    .style("stroke", "black")
                    .style("stroke-width", 2)
                    .style("opacity", 1)
            }
            const mousemove = function (event, d) {
                tooltip
                    .html("<strong>" + "Category: " + "</strong>" + d.data.category + "<br>" +
                        "<strong>" + "Youtuber count: " + "</strong>" + d.value)
                    .style("left", event.x + 10 + "px")
                    .style("top", event.y + 10 + "px")
            }
            const mouseleave = function (event, d) {
                tooltip
                    .style("opacity", 0)
                d3.select(this)
                    .style("stroke", "none")
            }

            // use this information to add rectangles:
            var enter = graph
                .selectAll("rect")
                .data(parentArray)
                .enter()
                .append("rect")
                .attr('x', d => d.x0)
                .attr('y', d => d.y0)
                .attr('width', d => (d.x1 - d.x0))
                .attr('height', d => (d.y1 - d.y0))
                .style("stroke", "black")
                .style("fill", color)
                .on("mouseover", mouseover)
                .on("mousemove", mousemove)
                .on("mouseleave", mouseleave)
                .on("click", this.treemap_onClick)

            // and to add the text labels
            graph
                .selectAll("text")
                .data(parentArray)
                .enter()
                .append("text")
                .selectAll('tspan')
                .data(d => {
                    return d.value > 10 ? d.data.category.split(/(?=[A-Z][^A-Z])/g) // split the name of movie
                        .map(v => {
                            return {
                                text: v,
                                x0: d.x0,                        // keep x0 reference
                                y0: d.y0                         // keep y0 reference
                            }
                        }) : ""
                })
                .enter()
                .append('tspan')
                .attr("x", d => (d.x0 + 5))  // +10 to adjust position (more right)
                .attr("y", (d, i) => (d.y0 + 20 + (i * 15)))    // +20 to adjust position (lower)
                .text(d => d.text)
                .attr("font-size", "15px")
                .attr("fill", "white")
        }, // treemap_categories_create
    }, // methods

    mounted() {
        const color = d3.scaleOrdinal(d3.schemePaired);
        for (let [c, val] of Object.entries(this.countryColorMap)) {
            this.countryColorMap[c] = color(c);
            this.legendColorMap.push([c, color(c)]);
        }

        d3.csv("../data/Global YouTube Statistics.csv", (row, i) => {
            const countriesToInclude = ["Canada", "Germany", "France", "United Kingdom", "India", "Japan", "Mexico", "United States", "Russia", "South Korea", "Brazil", "Indonesia", "Spain", "Thailand", "Argentina", "Colombia", "Others"]
            
            // ["United States", "India", "Brazil",
            //     "United Kingdom", "Mexico", "Indonesia", "Spain", "Thailand", "South Korea",
            //     "Russia", "Canada"]; // , "Argentina", "Colombia", "Japan"];
                // ["Canada", "United Kingdom", "India", "Mexico",  "United States", "Russia", "South Korea", "Others"]
                // ["Brazil", "Indonesia", "Spain", "Thailand"]
                // ["Germany", "France", "Japan"]
                //  {"Canada": null, "Germany": null, "France": null, "United Kingdom": null, "India": null, "Mexico": null, "United States": null, "Russia": null, "South Korea": null, "Others": null},
            const categoriestoExclude = ["Autos & Vehicles", "Education", "Pets & Animals",
                "Movies", "Howto & Style", "News & Politics", "Science & Technology", "Shows",
                "Travel & Events", "Trailers", "Nonprofits & Activism"];

            return {
                youtuber: row.Youtuber,
                subscribers: +row.subscribers,
                country: countriesToInclude.indexOf(row.Country) >= 0 ? row.Country : "Other",
                category: categoriestoExclude.indexOf(row.category) < 0 ? row.category : "Other"
            };
        }).then(rows => {
            // Filter out "nan" country
            rows = rows.filter(row => row.country && row.country.toLowerCase() !== "nan");

            // Sort rows
            rows = rows.sort((a, b) => b.subscribers - a.subscribers);

            // Add colours for country
            // Group data by country
            // var groupedData = d3.group(rows, d => d.country);

            // // // Calculate total subscribers for each country
            // var countrySubscribers = new Map();
            // groupedData.forEach((group, country) => {
            //     var totalSubscribers = d3.sum(group, d => d.subscribers);
            //     countrySubscribers.set(country, totalSubscribers);
            // });

            // // Sort countries by total subscribers in descending order
            // var topCountries = Array.from(countrySubscribers)
            //     .sort((a, b) => b[1] - a[1]);

            // // Assign colors to countries
            // topCountries.forEach((country, i) => {
            //     country[1] = i;
            //     country[2] = "#000000";
            // });

            // this.legend_data = topCountries;
            // var countryColorsDict = Object.assign({}, ...topCountries.map((x) => ({ [x[0]]: x[2] })));
            // {"USA": "#000000", India: "#01FF01", ...}

            // Add colour to rows based on country
            var country_list = ["Canada", "Germany", "France", "United Kingdom", "India", "Japan", "Mexico", "United States", "Russia", "South Korea", "Brazil"]
            rows.forEach(youtuber => youtuber.color = country_list.indexOf(youtuber.country) >= 0 ? this.countryColorMap[youtuber.country] : this.countryColorMap["Others"]);

            // Record data
            this.data = rows;

            // Filter to top 20
            this.top_channels_filter();

            // Plot graphs
            this.top_channels_create(this.data_top);
            this.generate_legend();
            this.treemap_countries_create(this.data);
            this.treemap_categories_create(this.data);
        }).catch(error => {
            console.log(error);
        });
    }
})

const channels = app.mount('#channels')