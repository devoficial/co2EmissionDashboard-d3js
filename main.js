// 1. get data into JS
// 2. make map
// 3. make pie chart
// 4. make bar chart
// 5. tooltip!

// Data fetching
Promise.all([
    d3.json("//unpkg.com/world-atlas@1.1.4/world/50m.json"),
    d3.csv("./data/all_data.csv", (row) => {
        // Getting the datas from the csv file rows
        return {
            continent:row.Continent,
            country:row.Country,
            countryCode:row["Country Code"],
            emissions:+row["Emissions"],
            emissionsPerCapita:+row["Emissions Per Capita"],
            region:row.Region,
            year:+row.Year
        }
    }),
])
.then((files) => files)

.catch((err) => console.error(err))
.then(data => {
    let [mapData, co2Data] = data;
    // console.log(data)
    const extremeYears = d3.extent(co2Data, d => d.year);
   let currentYear = extremeYears[0];
   let currentDataType = d3.select("input[name='data-type']:checked").attr("value");

   const geoData = topojson.feature(mapData, mapData.objects.countries).features;
   let width = +d3.select(".chart-container")
        .node().offsetWidth;
    // Draw the pie
    const height = 300;
    createPie(width,height)
    drawPie(co2Data,currentYear)
    //draw the map 
    createBar(width,height);
    createMap(width, (width * 4)/5);
    drawMap(geoData,co2Data, currentYear, currentDataType);
    drawBar(co2Data,currentDataType,"")
    d3.select("#year")
        .property("min", currentYear)
        .property("max", extremeYears[1])
        .property("value", currentYear)
        .on("input", () => {
            console.log("yes")
            currentYear = +d3.event.target.value;
            drawMap(geoData, co2Data, currentYear, currentDataType);
            drawPie(co2Data,currentYear);
            highLightBars(currentYear)
        })
        d3.selectAll('input[name="data-type"]')
        .on("change", () => {
          currentDataType = d3.event.target.value;
          const active =  d3.select(".active").data()[0];
          let country = active? active.properties.country:"";
          drawMap(geoData, co2Data, currentYear, currentDataType);
          drawBar(co2Data,currentDataType,country);
        });
        d3.selectAll("svg")
        .on("mousemove touchmove", updateTooltip);
        function updateTooltip() {
            let tooltip = d3.select(".tooltip");
            let tgt = d3.select(d3.event.target);
            let isCountry = tgt.classed("country");
            let isBar = tgt.classed("bar");
            let isArc = tgt.classed("arc");
            let dataType = d3.select("input:checked")
                             .property("value");
            let units = dataType === "emissions" ? "thousand metric tons" : "metric tons per capita";
            let data;
            let percentage = "";
            if (isCountry) data = tgt.data()[0].properties;
            if (isArc) {
              data = tgt.data()[0].data;
              percentage = `<p>Percentage of total: ${getPercentage(tgt.data()[0])}</p>`;
            }
            if (isBar) data = tgt.data()[0];
            tooltip
                .style("opacity", +(isCountry || isArc || isBar))
                .style("left", (d3.event.pageX - tooltip.node().offsetWidth / 2) + "px")
                .style("top", (d3.event.pageY - tooltip.node().offsetHeight - 10) + "px");
            if (data) {
              let dataValue = data[dataType] ?
                data[dataType].toLocaleString() + " " + units :
                "Data Not Available";
              tooltip 
                  .html(`
                    <p>Country: ${data.country}</p>
                    <p>${formatDataType(dataType)}: ${dataValue}</p>
                    <p>Year: ${data.year || d3.select("#year").property("value")}</p>
                    ${percentage}
                  `)
            }
          }
   
})
function formatDataType(key) {
    return key[0].toUpperCase() + key.slice(1).replace(/[A-Z]/g, c => " " + c);
  }
  
  function getPercentage(d) {
    let angle = d.endAngle - d.startAngle;
    let fraction = 100 * angle / (Math.PI * 2);
    return fraction.toFixed(2) + "%";
  }