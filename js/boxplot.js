// Declare the chart dimensions and margins.
const chartWidth = 500;
const chartHeight = 400;
var margin = {top: 50, right: 50, bottom: 80, left: 50},
width = chartWidth - margin.left - margin.right,
height = chartHeight - margin.top - margin.bottom;

var key = function(d){ return d.key; };

var x, y, boxWidth, Tooltip
var stats, q1, median, q3, interQuantileRange, min, max;

const app = Vue.createApp({
    data() {
        return {
            selected_country: "US",
            selected_month: "May",
            type: "Views",
            countries: [
                {
                    name: "Canada",
                    code: "CA",
                },
                {
                    name: "Germany",
                    code: "DE",
                },
                {
                    name: "France",
                    code: "FR",
                },
                {
                    name: "Great Britain",
                    code: "GB",
                },
                {
                    name: "India",
                    code: "IN",
                },
                {
                    name: "Japan",
                    code: "JP",
                },
                {
                    name: "South Korea",
                    code: "KR",
                },
                {
                    name: "Mexico",
                    code: "MX",
                },
                {
                    name: "Russia",
                    code: "RU",
                },
                {
                    name: "United States",
                    code: "US",
                }],
            months: ["January","February","March","April","May","June","July","August","September","October","November","December"],
            months_ddl : [],
            categories: ["Comedy","Entertainment","Film & Animation","Gaming","Music","People & Blogs","Sports"],
        }
    },
    methods: {
        updateChart() {
            country = this.selected_country
            month = this.selected_month
            type = this.type
            d3.selectAll("#boxplot").selectAll("svg").remove()
            this.getEarlyData(country, month, type)
            this.getLateData(country, month, type)
        },

        getEarlyData(country, month, type){
            categories= this.categories
            
            d3.csv("data/trending_stats/" + country + "_early.csv", (row, i) => {
                if (type=="Views"){
                    return {
                        category: row.category,
                        // title: row.title,
                        // channel: row.channel_title,
                        // value: +row.views,
                        min: +row.views_min > 0 ? Math.log10(+row.views_min) : 0,
                        q1: +row.views_q1 > 0 ? Math.log10(+row.views_q1) : 0,
                        median: +row.views_median > 0 ? Math.log10(+row.views_median) : 0,
                        q3: +row.views_q3 > 0 ? Math.log10(+row.views_q3) : 0,
                        max: +row.views_max > 0 ? Math.log10(+row.views_max) : 0,
                        // log: +row.views > 0 ? Math.log10(+row.views) : 0,
                        month: this.months[Number(row.month.slice(-2))-1],
                        year: Number(row.month.slice(0,4)),
                        key: i
                    };
                }
                else if (type=="Likes"){
                    return {
                        category: row.category,
                        min: +row.likes_min > 0 ? Math.log10(+row.likes_min) : 0,
                        q1: +row.likes_q1 > 0 ? Math.log10(+row.likes_q1) : 0,
                        median: +row.likes_median > 0 ? Math.log10(+row.likes_median) : 0,
                        q3: +row.likes_q3 > 0 ? Math.log10(+row.likes_q3) : 0,
                        max: +row.likes_max > 0 ? Math.log10(+row.likes_max) : 0,
                        month: this.months[Number(row.month.slice(-2))-1],
                        year: Number(row.month.slice(0,4)),
                        key: i
                    };
                }

                else if (type=="Dislikes"){
                    return {
                        category: row.category,
                        min: +row.dislikes_min > 0 ? Math.log10(+row.dislikes_min) : 0,
                        q1: +row.dislikes_q1 > 0 ? Math.log10(+row.dislikes_q1) : 0,
                        median: +row.dislikes_median > 0 ? Math.log10(+row.dislikes_median) : 0,
                        q3: +row.dislikes_q3 > 0 ? Math.log10(+row.dislikes_q3) : 0,
                        max: +row.dislikes_max > 0 ? Math.log10(+row.dislikes_max) : 0,
                        month: this.months[Number(row.month.slice(-2))-1],
                        year: Number(row.month.slice(0,4)),
                        key: i
                    };
                }

                else if (type=="Comments"){
                    return {
                        category: row.category,
                        min: +row.comment_count_min > 0 ? Math.log10(+row.comment_count_min) : 0,
                        q1: +row.comment_count_q1 > 0 ? Math.log10(+row.comment_count_q1) : 0,
                        median: +row.comment_count_median > 0 ? Math.log10(+row.comment_count_median) : 0,
                        q3: +row.comment_count_q3 > 0 ? Math.log10(+row.comment_count_q3) : 0,
                        max: +row.comment_count_max > 0 ? Math.log10(+row.comment_count_max) : 0,
                        month: this.months[Number(row.month.slice(-2))-1],
                        year: Number(row.month.slice(0,4)),
                        key: i
                    };
                }
                
            }).then(rows => {
                // console.log(rows);
                rows = rows.filter(function(d) { return categories.includes(d.category);})
                rows = rows.filter(function(d) { return d.month == month; })
                // rows = rows.filter((v, i, a) => a.findLastIndex(v2=>(v2.title === v.title))===i)
                rows.sort(function(a,b) { return (a.category).localeCompare(b.category); });
                
                this.makeChart(rows, country, month, "2018", "early")
                
            }).catch(error => {
                console.log(error);
            });
        },

        getLateData(country, month, type){
            categories= this.categories

            d3.csv("data/trending_stats/" + country + "_late.csv", (row, i) => {
                if (type=="Views"){
                    return {
                        category: row.category,
                        min: +row.views_min > 0 ? Math.log10(+row.views_min) : 0,
                        q1: +row.views_q1 > 0 ? Math.log10(+row.views_q1) : 0,
                        median: +row.views_median > 0 ? Math.log10(+row.views_median) : 0,
                        q3: +row.views_q3 > 0 ? Math.log10(+row.views_q3) : 0,
                        max: +row.views_max > 0 ? Math.log10(+row.views_max) : 0,
                        month: this.months[Number(row.month.slice(-2))-1],
                        year: Number(row.month.slice(0,4)),
                        key: i
                    };
                }
                else if (type=="Likes"){
                    return {
                        category: row.category,
                        min: +row.likes_min > 0 ? Math.log10(+row.likes_min) : 0,
                        q1: +row.likes_q1 > 0 ? Math.log10(+row.likes_q1) : 0,
                        median: +row.likes_median > 0 ? Math.log10(+row.likes_median) : 0,
                        q3: +row.likes_q3 > 0 ? Math.log10(+row.likes_q3) : 0,
                        max: +row.likes_max > 0 ? Math.log10(+row.likes_max) : 0,
                        month: this.months[Number(row.month.slice(-2))-1],
                        year: Number(row.month.slice(0,4)),
                        key: i
                    };
                }

                else if (type=="Dislikes"){
                    return {
                        category: row.category,
                        min: +row.dislikes_min > 0 ? Math.log10(+row.dislikes_min) : 0,
                        q1: +row.dislikes_q1 > 0 ? Math.log10(+row.dislikes_q1) : 0,
                        median: +row.dislikes_median > 0 ? Math.log10(+row.dislikes_median) : 0,
                        q3: +row.dislikes_q3 > 0 ? Math.log10(+row.dislikes_q3) : 0,
                        max: +row.dislikes_max > 0 ? Math.log10(+row.dislikes_max) : 0,
                        month: this.months[Number(row.month.slice(-2))-1],
                        year: Number(row.month.slice(0,4)),
                        key: i
                    };
                }

                else if (type=="Comments"){
                    return {
                        category: row.category,
                        min: +row.comment_count_min > 0 ? Math.log10(+row.comment_count_min) : 0,
                        q1: +row.comment_count_q1 > 0 ? Math.log10(+row.comment_count_q1) : 0,
                        median: +row.comment_count_median > 0 ? Math.log10(+row.comment_count_median) : 0,
                        q3: +row.comment_count_q3 > 0 ? Math.log10(+row.comment_count_q3) : 0,
                        max: +row.comment_count_max > 0 ? Math.log10(+row.comment_count_max) : 0,
                        month: this.months[Number(row.month.slice(-2))-1],
                        year: Number(row.month.slice(0,4)),
                        key: i
                    };
                }
                
            }).then(rows => {
                // console.log(rows);
                rows = rows.filter(function(d) { return categories.includes(d.category);})
                rows = rows.filter(function(d) { return d.month == month && d.year == 2022; })
                // rows = rows.filter((v, i, a) => a.findLastIndex(v2=>(v2.title === v.title))===i)
                rows.sort(function(a,b) { return (a.category).localeCompare(b.category); });
                this.makeChart(rows, country, month, "2022", "late")
                
            }).catch(error => {
                console.log(error);
            });
        },

        makeChart(data, country, month, year, period){

            // append the svg object to the body of the page
            var svg = d3.select("#boxplot")
            .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .attr("class", period)
            .append("g")
                .attr("transform",
                    "translate(" + margin.left + "," + margin.top + ")");
            
            let displayYear = year;
            if (year < 2019) {
                displayYear = month == "November" || month == "December" ? 2017 : 2018;
            }

            svg
            .append("text")
            .attr("class", "legendTitle")
            .attr("x", chartWidth/2 - 200)
            .attr("y", -20)
            .text(this.type + " (Log) by Category in " + country + " in " + month + " " + displayYear)
            .style("font-weight", "bold");
        
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
        
            boxWidth = 30
        
            // stats = d3.rollup(data, function(d) {
                // q1 = d3.quantile(d.map(function(g) { return g.log;}).sort(d3.ascending),.25)
                // median = d3.quantile(d.map(function(g) { return g.log;}).sort(d3.ascending),.5)
                // q3 = d3.quantile(d.map(function(g) { return g.log;}).sort(d3.ascending),.75)
                // interQuantileRange = q3 - q1
                // min = q1 - 1.5 * interQuantileRange
                // max = q3 + 1.5 * interQuantileRange
                // min = d3.min(d.map(function(g) { return g.log;}).sort(d3.ascending))
                // max = d3.max(d.map(function(g) { return g.log;}).sort(d3.ascending))
                // console.log(d)
            //     return({q1: q1, median: median, q3: q3, interQuantileRange: interQuantileRange, min: min, max: max})
            // }, d => d.category)
            // console.log(data)
        
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
                    .style("text-anchor", "end")
            svg.select(".xaxis")
                .append("text")
                    .attr("class", "xaxisTitle")
                    .text("Category")
                    .attr("x", width + 40)
                    .attr("dy", 50)
                    .style("text-anchor", "end")
                    .style("fill", "black")
                    .style("font-size", "13px")
                    .style("font-weight", "bold");
        
            // Show the Y scale
            y = d3.scaleLinear()
                .domain([0,10])
                // .domain([0,d3.max(data, d => d.log)])
                .range([height, 0])
            svg.append("g")
                .attr("transform", `translate(0,0)`)
                .attr("class", "yaxis")
                .call(d3.axisLeft(y))
                .append("text")
                    .attr("class", "yaxisTitle")
                    .text(this.type +  " (Log)")
                    .attr("transform", "rotate(-90)")
                    .attr("y", -30)
                    .attr("dx",10)
                    .style("text-anchor", "end")
                    .style("fill", "black")
                    .style("font-size", "13px")
                    .style("font-weight", "bold");
        
            // // Show the main vertical line
            svg
                .selectAll(".vertLines")
                .data(data)
                .enter()
                .append("line")
                    .attr("class", "vertLines")
                    .attr("x1", function(d){return(x(d.category))})
                    .attr("x2", function(d){return(x(d.category))})
                    .attr("y1", function(d){return(y(d.min))})
                    .attr("y2", function(d){return(y(d.max))})
                    .attr("stroke", "black")
                    .style("width", 40)
        
            // Show max line
            svg
                .selectAll("maxLines")
                .data(data)
                .enter()
                .append("line")
                    .attr("x1", function(d){return(x(d.category)-boxWidth/2)})
                    .attr("x2", function(d){return(x(d.category)+boxWidth/2)})
                    .attr("y1", function(d){return(y(d.max))})
                    .attr("y2", function(d){return(y(d.max))})
                    .attr("stroke", "black")
                    .style("width", 80)
        
            // Show min line
            svg
                .selectAll("minLines")
                .data(data)
                .enter()
                .append("line")
                    .attr("x1", function(d){return(x(d.category)-boxWidth/2) })
                    .attr("x2", function(d){return(x(d.category)+boxWidth/2) })
                    .attr("y1", function(d){return(y(d.min))})
                    .attr("y2", function(d){return(y(d.min))})
                    .attr("stroke", "black")
                    .style("width", 80)
        
            // rectangle for the main box    
            svg
                .selectAll("boxes")
                .data(data)
                .enter()
                .append("rect")
                    .attr("x", function(d){return(x(d.category)-boxWidth/2)})
                    .attr("y", function(d){return(y(d.q3))})
                    .attr("height", function(d){return(y(d.q1)-y(d.q3))})
                    .attr("width", boxWidth )
                    .attr("stroke", "black")
                    .style("fill", "#a6cee3")
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
                    .html("<b>Max: </b>" + d.max.toFixed(2) +"<br><b>Min: </b>" + d.min.toFixed(2) + "<br><b>Q1: </b>" + d.q1.toFixed(2) + "<br><b>Median: </b>" + d.median.toFixed(2) + "<br><b>Q3: </b>" + d.q3.toFixed(2))
                    .style("left", (event.pageX+20) + 'px')
                    .style("top", (event.pageY+20) + 'px')
                })
            
                .on("mouseout", function(event, d){
                    Tooltip
                    .style("opacity", 0)
                })
            
            // // Show the median
            svg
                .selectAll("medianLines")
                .data(data)
                .enter()
                .append("line")
                    .attr("x1", function(d){return(x(d.category)-boxWidth/2) })
                    .attr("x2", function(d){return(x(d.category)+boxWidth/2) })
                    .attr("y1", function(d){return(y(d.median))})
                    .attr("y2", function(d){return(y(d.median))})
                    .attr("stroke", "black")
                    .style("width", 80)
        
            // Add individual points
            // svg
            // .selectAll("indPoints")
            // .data(data)
            // .enter()
            // .append("circle")
            //     .attr("cx", function(d){return(x(d.category) )})
            //     .attr("cy", function(d){return(y(d.log))})
            //     .attr("r", 3)
            //     .style("fill", "white")
            //     .attr("stroke", "black")
            //     .attr("opacity", 0.5)
            // // Interaction
            // .on("mouseover", function(event, d){
            //     Tooltip
            //     .style("opacity", 1)
            //     d3.select(this)
            //     .style("stroke", "black")
            //     .style("opacity", 1)
                
            // })
            // .on("mousemove", function(event, d){
            //     Tooltip
            //     .html("<b>Video: </b>" + d.title +"<br><b>Channel: </b>" + d.channel + "<br><b>Count: </b>" + d.value)
            //     .style("left", (event.pageX+20) + 'px')
            //     .style("top", (event.pageY+20) + 'px')
            // })
        
            // .on("mouseout", function(event, d){
            //     Tooltip
            //     .style("opacity", 0)
            // })
        
        
        },

        update(data, country, month, year, period){
            // stats = d3.rollup(data, function(d) {
                // q1 = d3.quantile(d.map(function(g) { return g.log;}).sort(d3.ascending),.25)
                // median = d3.quantile(d.map(function(g) { return g.log;}).sort(d3.ascending),.5)
                // q3 = d3.quantile(d.map(function(g) { return g.log;}).sort(d3.ascending),.75)
                // interQuantileRange = q3 - q1
                // min = q1 - 1.5 * interQuantileRange
                // max = q3 + 1.5 * interQuantileRange

                // min = d3.min(d.map(function(g) { return g.log;}).sort(d3.ascending))
                // max = d3.max(d.map(function(g) { return g.log;}).sort(d3.ascending))
                // console.log(d)
            //     return({q1: q1, median: median, q3: q3, interQuantileRange: interQuantileRange, min: min, max: max})
            // }, d => d.category)
            // console.log(stats)
        
            var svg = d3.selectAll("#boxplot").select("." + period)
        
            svg
            .select(".legendTitle")
            .text(this.type + " (Log) by Category in " + country + " in " + month + " " + year);
        
            //   Show the X scale
            x = d3.scaleBand()
                .range([ 0, width ])
                .domain(data.map(d=> d.category))
                .paddingInner(1)
                .paddingOuter(.5)

            xAxis = d3.axisBottom().scale(x).ticks(0);
        
            svg.selectAll(".xaxis").select(".xaxisTitle").remove()
            svg.selectAll(".xaxis")
                .call(xAxis)
                .selectAll("text")
                    .attr("y", 15)
                    .attr("x", 9)
                    .attr("dy", ".35em")
                    .attr("transform", "rotate(-45)")
                    .style("text-anchor", "end");

            svg.select(".xaxis")
            .append("text")
                .attr("class", "xaxisTitle")
                .text("Category")
                .attr("x", width + 40)
                .attr("dy", 50)
                .style("text-anchor", "end")
                .style("fill", "black")
                .style("font-size", "13px")
                .style("font-weight", "bold");
        
            //   Show the Y scale
            y = d3.scaleLinear()
                .domain([0,10])
                // .domain([0,d3.max(data, d => d.log)])
                .range([height, 0])
            svg.selectAll(".yaxis")
            .call(d3.axisLeft(y))
            .select(".yaxisTitle").text(this.type +  " (Log)")
        
            // Show the main vertical line
            var lines = svg.selectAll("line").data(data, key)
            lines.exit().transition().duration(1000)
                .attr("width", 0)
                .attr("opacity", 0)
                .remove()
            lines.enter().append("line")
                .attr("x1", function(d){return(x(d.category)+ margin.left)})
                .attr("x2", function(d){return(x(d.category) + margin.left)})
                .attr("y1", function(d){return(y(d.min))})
                .attr("y2", function(d){return(y(d.max))})
                .attr("stroke", "black")
                .style("width", 40)
        
            // Show max line
            lines.enter().append("line")
                .attr("x1", function(d){return(x(d.category)-boxWidth/2 + margin.left)})
                .attr("x2", function(d){return(x(d.category)+boxWidth/2 + margin.left)})
                .attr("y1", function(d){return(y(d.max))})
                .attr("y2", function(d){return(y(d.max))})
                .attr("stroke", "black")
                .style("width", 80)
        
            // // Show min line
            lines.enter().append("line")
                .attr("x1", function(d){return(x(d.category)-boxWidth/2 + margin.left) })
                .attr("x2", function(d){return(x(d.category)+boxWidth/2 + margin.left) })
                .attr("y1", function(d){return(y(d.min))})
                .attr("y2", function(d){return(y(d.min))})
                .attr("stroke", "black")
                .style("width", 80)
        
            // Update box
            svg.selectAll("rect").remove()
            
            var boxes = svg.selectAll("rect").data(data, key)
            boxes.exit().transition().duration(1000)
                .attr("height", 0)
                .attr("width", 0)
                .attr("opacity", 0)
                .remove()
        
            boxes.enter().append("rect")
                .attr("x", function(d){return(x(d.category)-boxWidth/2 + margin.left)})
                .attr("y", function(d){return(y(d.q3))})
                .attr("height", function(d){return(y(d.q1)-y(d.q3))})
                .attr("width", boxWidth )
                .attr("stroke", "black")
                .attr("fill", "#a6cee3")
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
                    .html("<b>Max: </b>" + d.max.toFixed(2) +"<br><b>Min: </b>" + d.min.toFixed(2) + "<br><b>Q1: </b>" + d.q1.toFixed(2) + "<br><b>Median: </b>" + d.median.toFixed(2) + "<br><b>Q3: </b>" + d.q3.toFixed(2))
                    .style("left", (event.pageX+20) + 'px')
                    .style("top", (event.pageY+20) + 'px')
                })
            
                .on("mouseout", function(event, d){
                    Tooltip
                    .style("opacity", 0)
                })
        
            // Show the median
            lines.enter().append("line")
                .attr("x1", function(d){return(x(d.category)-boxWidth/2 + margin.left) })
                .attr("x2", function(d){return(x(d.category)+boxWidth/2 + margin.left) })
                .attr("y1", function(d){return(y(d.median))})
                .attr("y2", function(d){return(y(d.median))})
                .attr("stroke", "black")
                .style("width", 80)
        
            // Add individual points
            // var circles = svg.selectAll("circle").data(data, key)
            // circles.exit().transition().duration(1000)
            //     .attr("r", 0)
            //     .attr("opacity", 0)
            //     .remove()
        
            // circles.enter().append("circle")
            //     .attr("cx", function(d){return(x(d.category) + margin.left)})
            //     .attr("cy", function(d){return(y(d.log))})
            //     .attr("r", 3)
            //     .style("fill", "white")
            //     .attr("stroke", "black")
            //     .attr("opacity", 0.5)
                  
            // // Interaction
            // .on("mouseover", function(event, d){
            //     Tooltip
            //     .style("opacity", 1)
            //     d3.select(this)
            //     .style("stroke", "black")
            //     .style("opacity", 1)
                
            // })
            // .on("mousemove", function(event, d){
            //     Tooltip
            //     .html("<b>Video: </b>" + d.title +"<br><b>Channel: </b>" + d.channel + "<br><b>Count: </b>" + d.value)
            //     .style("left", (event.pageX+20) + 'px')
            //     .style("top", (event.pageY+20) + 'px')
            // })
        
            // .on("mouseout", function(event, d){
            //     Tooltip
            //     .style("opacity", 0)
            // })
        
            
        }

    },

    created() {
        categories= this.categories

        d3.csv("data/trending_stats/US_early.csv", (row, i) => {
            return {
                category: row.category,
                min: +row.views_min > 0 ? Math.log10(+row.views_min) : 0,
                q1: +row.views_q1 > 0 ? Math.log10(+row.views_q1) : 0,
                median: +row.views_median > 0 ? Math.log10(+row.views_median) : 0,
                q3: +row.views_q3 > 0 ? Math.log10(+row.views_q3) : 0,
                max: +row.views_max > 0 ? Math.log10(+row.views_max) : 0,
                month: this.months[Number(row.month.slice(-2))-1],
                year: Number(row.month.slice(0,4)),
                key: i
            };
        }).then(rows => {
            this.months_ddl = []
            for (var i = 0; i <= rows.length; i++) {
                if(rows[i] != undefined){
                    if(!this.months_ddl.includes(rows[i].month)){
                        this.months_ddl.push(rows[i].month)
                    }
                }
            }
            rows = rows.filter(function(d) { return categories.includes(d.category);})
            rows = rows.filter(function(d) { return d.month == 'May'; })
            // rows = rows.filter((v, i, a) => a.findLastIndex(v2=>(v2.title === v.title))===i)
            rows.sort(function(a,b) { return (a.category).localeCompare(b.category); });
            console.log(rows);
            this.makeChart(rows, "US", "May", "2018", "early")
            
        }).catch(error => {
            console.log(error);
        });

        d3.csv("data/trending_stats/US_late.csv", (row, i) => {
            return {
                category: row.category,
                min: +row.views_min > 0 ? Math.log10(+row.views_min) : 0,
                q1: +row.views_q1 > 0 ? Math.log10(+row.views_q1) : 0,
                median: +row.views_median > 0 ? Math.log10(+row.views_median) : 0,
                q3: +row.views_q3 > 0 ? Math.log10(+row.views_q3) : 0,
                max: +row.views_max > 0 ? Math.log10(+row.views_max) : 0,
                month: this.months[Number(row.month.slice(-2))-1],
                year: Number(row.month.slice(0,4)),
                key: i
            };
        }).then(rows => {
            rows = rows.filter(function(d) { return categories.includes(d.category);})
            rows = rows.filter(function(d) { return d.month == 'May' && d.year == '2022'; })
            // rows = rows.filter((v, i, a) => a.findLastIndex(v2=>(v2.title === v.title))===i)
            rows.sort(function(a,b) { return (a.category).localeCompare(b.category); });
            this.makeChart(rows, "US", "May", "2022", "late")
            // console.log(rows);
        }).catch(error => {
            console.log(error);
        });
    }
    
})
app.mount('#app')
