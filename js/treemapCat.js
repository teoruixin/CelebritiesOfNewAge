// Treemap for total count of YouTubers per category 

// Import data into the "youtube" object.
const youtube = await d3.csv("data/Global YouTube Statistics.csv").then(rows => {
  console.log("data:", rows)
  treemap_create(rows);
});

// Count of youtubers per category
// function countYoutubers(category) {
//   var count = 0;
//   var youtuberCount = {}
//   for (var i = 0; i < youtube.length; i++) {
//     if (youtube[i].category == category) {
//       count++;
//       youtuberCount["category"] = category;
//       youtuberCount["value"] = count;
//     }
//   }
//   return youtuberCount;
// }

function treemap_countYoutubers(data, target) {
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
  for (var key in youtuberCount) {
    output.push(youtuberCount[key]);
  }
  return output;
} // treemap_countYoutubers

function treemap_create(input_data) {
  // Make chart.

  // Declare the chart dimensions and margins.
  const width = 800;
  const height = 400;
  const marginTop = 30;
  const marginRight = 30;
  const marginBottom = 30;
  const marginLeft = 30;

  // console.log(youtube)
  // Get unique categories
  // const categories = [...new Set(youtube.map(d => d.category))].filter(d => d != "nan")
  // console.log(categories)

  var categoriesYoutubers = treemap_countYoutubers(input_data, "category")
  // for (var i = 0; i < categories.length; i++) {
  //   // console.log(countYoutubers(categories[i]))
  //   categoriesYoutubers[i] = countYoutubers(categories[i])
  // }
  // console.log(countriesYoutubers)

  var data = {
    "name": "Youtubers By Categories",
    "children": categoriesYoutubers
  };
  // console.log(data)

  // Create the SVG container, here named "graph". Specify size in width and height above ^
  const graph = d3.select("#treemapCat")
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
  // let matchParent = (category) => {
  //     return parentArray.find(d => d.data.category == category)
  // }
  console.log(parentArray)

  //tooltip
  var tooltip = d3.select("#treemapCat")
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
}