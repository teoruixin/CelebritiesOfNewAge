// Vue Application for "channels.html"

const app = Vue.createApp({
    data() {
        return {
            data: [],               // Stores all data
            data_top: [],           // Stores top youtuber data
            legend_data: [],        // Stores all country => colour mapping
            legend_data_top: [],    // Stores country => colour mapping for countries in data_top
            criteria: {             // Stores filter criteria
                country: [],
                category: [],
            },
            barChart: null,         // Stores the bar chart object
            barChart_dim: {         // Stores dimensions of bar chart 
                width: 1080,
                height: 400,
                marginTop: 20,
                marginRight: 20,
                marginBottom: 30,
                marginLeft: 100
            },
            treemap_dim: {          // Stores dimensions of treemap
                width: 800,
                height: 400,
                marginTop: 30,
                marginRight: 30,
                marginBottom: 30,
                marginLeft: 30
            }
        }
    }, // /data
    methods: {
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
            this.legend_data_top = this.legend_data.filter(entry => countries.indexOf(entry[0]) != -1)

            // // Display the legend
            var legend = d3.select(".legend")
                .selectAll(".legend-entry")
                .data(this.legend_data_top, d => d[0])
                .enter()
                .append("div")
                .attr("class", "legend-entry");

            legend.append("svg")
                .attr("width", 15)
                .attr("height", 10)
                .attr("class", "legend-color")
                .append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", 10)
                .attr("height", 10)
                .attr("fill", (d) => d[2]);

            legend.append("span")
                .attr("class", "legend-text")
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

            graph.append("g")
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

            // Append SVG to div
            top_youtubers_div.append(graph.node());

            // Save graph to Vue
            this.barChart = graph;
        }, // top_channels_create

        top_channels_update() {
            // Declare chart dimensions.
            const width = this.barChart_dim.width;
            const height = this.barChart_dim.height;
            const marginTop = this.barChart_dim.marginTop;
            const marginRight = this.barChart_dim.marginRight;
            const marginBottom = this.barChart_dim.marginBottom;
            const marginLeft = this.barChart_dim.marginLeft;

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
                        .duration(750)
                        .attr("y", (d) => y(d.youtuber))
                        .attr('opacity', 1),

                    update => update
                        // Declare transition to final position
                        .transition()
                        .duration(750)
                        // .attr("x", marginLeft)
                        .attr("y", (d) => y(d.youtuber))
                        .attr("width", (d) => x(d.subscribers) - marginLeft)
                        .attr("height", y.bandwidth()),

                    exit => exit
                        // Declare transition to final position
                        .transition()
                        .duration(750)
                        .attr("y", height - marginBottom) // (d) => y(d.youtuber))
                        .attr('opacity', 0)
                        // then remove().
                        .remove()
                )
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
                    this.top_channels_update();
                    return;
                }
                this.criteria.country.push(d.data.country);
                this.top_channels_update();
                return;
            }
            if ("category" in d.data) {
                var tgtIndex = this.criteria.category.indexOf(d.data.category);
                if (tgtIndex >= 0) {
                    this.criteria.category.splice(tgtIndex, 1);
                    this.top_channels_update();
                    return;
                }
                this.criteria.category.push(d.data.category);
                this.top_channels_update();
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

            const color = d3.scaleOrdinal(["#271258", "#29115a", "#2a115c", "#2c115f", "#2d1161", "#2f1163", "#311165", "#331067", "#341069", "#36106b", "#38106c", "#390f6e", "#3b0f70", "#3d0f71", "#3f0f72", "#400f74", "#420f75", "#440f76", "#451077", "#471078", "#491078", "#4a1079", "#4c117a", "#4e117b", "#4f127b", "#51127c", "#52137c", "#54137d", "#56147d", "#57157e", "#59157e", "#5a167e", "#5c167f", "#5d177f", "#5f187f", "#601880", "#621980", "#641a80", "#651a80", "#671b80", "#681c81", "#6a1c81", "#6b1d81", "#6d1d81", "#6e1e81", "#701f81", "#721f81", "#732081", "#752181", "#762181", "#782281", "#792282", "#7b2382", "#7c2382", "#7e2482", "#802582", "#812581", "#832681", "#842681", "#862781", "#882781", "#892881", "#8b2981", "#8c2981", "#8e2a81", "#902a81", "#912b81", "#932b80", "#942c80", "#962c80", "#982d80", "#992d80", "#9b2e7f", "#9c2e7f", "#9e2f7f", "#a02f7f", "#a1307e", "#a3307e", "#a5317e", "#a6317d", "#a8327d", "#aa337d", "#ab337c", "#ad347c", "#ae347b", "#b0357b", "#b2357b", "#b3367a", "#b5367a", "#b73779", "#b83779", "#ba3878", "#bc3978", "#bd3977", "#bf3a77", "#c03a76", "#c23b75", "#c43c75", "#c53c74", "#c73d73", "#c83e73", "#ca3e72", "#cc3f71", "#cd4071", "#cf4070", "#d0416f", "#d2426f", "#d3436e", "#d5446d", "#d6456c", "#d8456c", "#d9466b", "#db476a", "#dc4869", "#de4968", "#df4a68", "#e04c67", "#e24d66", "#e34e65", "#e44f64", "#e55064", "#e75263", "#e85362", "#e95462", "#ea5661", "#eb5760", "#ec5860", "#ed5a5f", "#ee5b5e", "#ef5d5e", "#f05f5e", "#f1605d", "#f2625d", "#f2645c", "#f3655c", "#f4675c", "#f4695c", "#f56b5c", "#f66c5c", "#f66e5c", "#f7705c", "#f7725c", "#f8745c", "#f8765c", "#f9785d", "#f9795d", "#f97b5d", "#fa7d5e", "#fa7f5e", "#fa815f", "#fb835f", "#fb8560", "#fb8761", "#fc8961", "#fc8a62", "#fc8c63", "#fc8e64", "#fc9065", "#fd9266", "#fd9467", "#fd9668", "#fd9869", "#fd9a6a", "#fd9b6b", "#fe9d6c", "#fe9f6d", "#fea16e", "#fea36f", "#fea571", "#fecd90", "#fecf92", "#fed194", "#fed395", "#fed597", "#fed799", "#fed89a", "#fdda9c", "#fddc9e", "#fddea0", "#fde0a1", "#fde2a3", "#fde3a5", "#fde5a7", "#fde7a9", "#fde9aa", "#fdebac", "#fcecae", "#fceeb0", "#fcf0b2", "#fcf2b4", "#fcf4b6", "#fcf6b8", "#fcf7b9", "#fcf9bb", "#fcfbbd", "#fcfdbf"])

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
                    return d.value > 10 ? d.data.country.split(/(?=[A-Z][^A-Z])/g) // split the name of movie
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

            const color = d3.scaleOrdinal(["#271258", "#29115a", "#2f1163", "#400f74", "#420f75", "#440f76", "#451077", "#471078", "#491078", "#51127c", "#52137c", "#54137d", "#56147d", "#57157e", "#59157e", "#601880", "#621980", "#641a80", "#651a80", "#671b80", "#681c81", "#6a1c81", "#6b1d81", "#6d1d81", "#6e1e81", "#701f81", "#721f81", "#732081", "#752181", "#762181", "#782281", "#792282", "#7b2382", "#7c2382", "#7e2482", "#802582", "#812581", "#832681", "#842681", "#862781", "#882781", "#892881", "#8b2981", "#8c2981", "#8e2a81", "#902a81", "#912b81", "#932b80", "#942c80", "#962c80", "#982d80", "#992d80", "#9b2e7f", "#9c2e7f", "#9e2f7f", "#a02f7f", "#a1307e", "#a3307e", "#a5317e", "#a6317d", "#a8327d", "#aa337d", "#ab337c", "#ad347c", "#ae347b", "#b0357b", "#b2357b", "#b3367a", "#b5367a", "#b73779", "#b83779", "#ba3878", "#bc3978", "#bd3977", "#bf3a77", "#c03a76", "#c23b75", "#c43c75", "#c53c74", "#c73d73", "#c83e73", "#ca3e72", "#cc3f71", "#cd4071", "#cf4070", "#d0416f", "#d2426f", "#d3436e", "#d5446d", "#d6456c", "#d8456c", "#d9466b", "#db476a", "#dc4869", "#de4968", "#df4a68", "#e04c67", "#e24d66", "#e34e65", "#e44f64", "#e55064", "#e75263", "#e85362", "#e95462", "#ea5661", "#eb5760", "#ec5860", "#ed5a5f", "#ee5b5e", "#ef5d5e", "#f05f5e", "#f1605d", "#f2625d", "#f2645c", "#f3655c", "#f4675c", "#f4695c", "#f56b5c", "#f66c5c", "#f66e5c", "#f7705c", "#f7725c", "#f8745c", "#f8765c", "#f9785d", "#f9795d", "#f97b5d", "#fa7d5e", "#fa7f5e", "#fa815f", "#fb835f", "#fb8560", "#fb8761", "#fc8961", "#fc8a62", "#fc8c63", "#fc8e64", "#fc9065", "#fd9266", "#fd9467", "#fd9668", "#fd9869", "#fd9a6a", "#fd9b6b", "#fe9d6c", "#fe9f6d", "#fea16e", "#fea36f", "#fea571", "#fecd90", "#fecf92", "#fed194", "#fed395", "#fed597", "#fed799", "#fed89a", "#fdda9c", "#fddc9e", "#fddea0", "#fde0a1", "#fde2a3", "#fde3a5", "#fde5a7", "#fde7a9", "#fde9aa", "#fdebac", "#fcecae", "#fceeb0", "#fcf0b2", "#fcf2b4", "#fcf4b6", "#fcf6b8", "#fcf7b9", "#fcf9bb", "#fcfbbd", "#fcfdbf"])

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
        var countryColors = d3.scaleOrdinal(d3.schemeCategory10);

        d3.csv("../data/Global YouTube Statistics.csv", (row, i) => {
            return {
                youtuber: row.Youtuber,
                subscribers: +row.subscribers,
                country: row.Country,
                category: row.category
            };
        }).then(rows => {
            // Filter out "nan" country
            rows = rows.filter(row => row.country && row.country.toLowerCase() !== "nan");

            // Sort rows
            rows = rows.sort((a, b) => b.subscribers - a.subscribers);

            // Add colours for country
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
                .sort((a, b) => b[1] - a[1]);

            // Assign colors to countries
            topCountries.forEach((country, i) => {
                country[1] = i;
                country[2] = countryColors(i);
            });

            this.legend_data = topCountries;
            var countryColorsDict = Object.assign({}, ...topCountries.map((x) => ({ [x[0]]: x[2] })));
            // {"USA": "#000000", India: "#01FF01", ...}

            // Add colour to rows based on country
            rows.forEach(youtuber => youtuber.color = countryColorsDict[youtuber.country]);

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