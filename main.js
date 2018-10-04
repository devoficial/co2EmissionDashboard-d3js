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
    createMap(width, (width * 4)/5);
    drawMap(geoData,co2Data, currentYear, currentDataType);
    d3.select("#year")
        .property("min", currentYear)
        .property("max", extremeYears[1])
        .property("value", currentYear)
        .on("input", () => {
            console.log("yes")
            currentYear = +d3.event.target.value;
            drawMap(geoData, co2Data, currentYear, currentDataType);
            drawPie(co2Data,currentYear);
        })
        d3.selectAll('input[name="data-type"]')
        .on("change", () => {
          currentDataType = d3.event.target.value;
          drawMap(geoData, co2Data, currentYear, currentDataType);
        });
})