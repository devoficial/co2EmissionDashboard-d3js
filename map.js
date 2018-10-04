function createMap(w, h){
    d3.select("#map")
        .attr("width", w)
        .attr("height", h)
     .append("text")
        .attr("x", w/2)
        .attr("y", "1em")
        .attr("font-size", "1.5em")
        .style('text-anchor', 'middle')
        .classed("map-title", true);
}

function drawMap(g,d,cy,cdt){
    const map = d3.select("#map");

    // create the projection for the map
    const projection = d3.geoMercator()
                    .scale(110)
                    .translate([
                        +map.attr("width")/2,
                        +map.attr("height")/1.4
                    ])
    // create the path for the map
    const path = d3.geoPath()
                    .projection(projection);
    // update the range input with the current year
    d3.select("#year-val").text(cy);

    g.forEach(element => {
        let countries = d.filter( row => row.countryCode === element.id )
        // console.log(countries)
        let name = "";
        if(countries.length > 0) name = countries[0].country;

        element.properties = countries.find(c => c.year === cy) || { country: name };
    });
 

    let colors = ["#f1c40f","#e67e22","#e74c3c","#c0392b"]
    let domains = {
        emissions:[0,2.5e5,1e6,5e6],
        emissionsPerCapita:[0,0.5,2,10]
    }
    // debugger
    let mapColor =d3.scaleLinear()
        .domain(domains[cdt])
        .range(colors);

    let update = map.selectAll(".country")
        .data(g);

    update.enter()
        .append("path")
            .classed("country",true)
            .attr("d", path)
        .merge(update)
            .transition()
            .duration(750)
            .attr("fill", d => {
                // console.log(d)
                let val = d.properties[cdt];
                return val ? mapColor(val) :"#ccc";
            })
    d3.select(".map-title")
            .text("Carbon Dioxide" + graphTitle(cdt) + ","+cy)
}
function graphTitle(str){
    return str.replace(/[A-Z]/g, c => " "+c.toLowerCase());
}

