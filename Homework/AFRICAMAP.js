
// define margins of the map
var margin = {top: 10, right: 20, bottom: 50, left: 400},
    width = 1200 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom;

var width_map = width + margin.left + margin.right,
    height_map = height + margin.top + margin.bottom;


// define initial variables
var headline = "How connected is Africa in ",
    variable = "Internet users per 100 inhabitants",
    year = 2014,
    countryName = "Togo";

// define adjustment for the linegraph
var XadjustLinegraph = -350,
    YadjustLinegraph = 200;
  
// turn year into Datetime 
var parseYear = d3.timeParse("%Y")

// define margins linegraph
var width_linegraph = 500,
    height_linegraph = 300;

// set the ranges
var x = d3.scaleTime().range(
    [XadjustLinegraph, width_linegraph  + XadjustLinegraph]
  );
var y = d3.scaleLinear().range( [height_linegraph, 0] );

window.onload = function(d){

  // create tooltip
  var tip = d3.tip()
      .attr('class', 'd3-tip')
      .offset([-5, 0])
      .html(function(d) { return d.properties["admin"]; });

  // create slider
  d3.select("body").insert("p", ":first-child").attr("class", "slider")
      .append("input")
      .attr("type", "range")
      .attr("min", "1980")
      .attr("max", "2014")
      .attr("value", year)
      .attr("id", "year");


 
  // create title
  var title = d3.select("body").insert("h1", ":first-child")
  title.text(headline + year + "?");

  // create menu to select country
  var button = d3.select("body").append("div")
      .attr("class", "menu")
  
  button
    .append("button")
      .attr("type", "button")
      .attr("class", "btn btn-primary dropdown-toggle")
      .attr("data-toggle", "dropdown")
      .text("Pick a variable!")
      .append("span")
      .attr("class", "caret")


  // create svg for map
  var map = d3.select("body").append("svg")
    .attr("width", width_map)
    .attr("height", height_map)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // call the tooltip
  d3.select("svg").call(tip)

  // path
  var path = d3.geoPath();

  // queue 
  var q = d3.queue()
    .defer(d3.json, "AFRICA.json")
    .defer(d3.json, "AFRICADATA.json")
    .await(makemap);

  // define range of colourscale
  var colorScale = d3.scaleLinear()
    .range(["#8B0000", "#00FF00"])
    .interpolate(d3.interpolateLab);

  // create horizontal line of crosshair
  var lineH = map.append("line")
          .attr('class', 'crossline')
          .attr('x1', x.range()[0])
          .attr('x2', x.range()[1])
          .attr("stroke-width", 2)
          .attr("stroke", "black")
          .attr("display", "none");

    // create vertical line of crosshair
    var lineV = map.append("line")
          .attr('class', 'crossline')
          .attr('y1', y.range()[0] + YadjustLinegraph)
          .attr('y2', y.range()[1] + YadjustLinegraph)
          .attr("stroke-width", 2)
          .attr("stroke", "black")
          .attr("display", "none");


  // function that gets the colour for an value
  function getColor(d, data, variable, time){
    
    country = d.properties["admin"]
    var data_country;

    // select country and indicator
    data.forEach(function(d){
      if (d["Country Name"] == country && d["Indicator Name"] == variable)
      {
        data_country = d
      }
    })

    // display grey if country has no data at all
    if (data_country == undefined)
    {
      return "grey"
    }
      
    var observation = data_country[String(time)]

    // display grey if no data for this specific year
    if (observation == "-")
    {
      return "grey"
    }
    // give colour for observation
    else
    {
      return colorScale(parseFloat(observation));
    }
  }

  // get the maximum and minimum from a list of dicts
  function getMaxMin(data, variable){

    var min = 0,
        max = 0;

    // get the max and min for a specific variable
    data.forEach(function(d){

      if (d["Indicator Name"] == variable)
      {

        var arr = Object.keys(d).map(function ( key ) {
        var checker = parseFloat(d[key]);

          if (Number.isInteger(checker))
          {
            return checker;
          }
          else
          {
            return 0; 
          }
        });

        var temp_min = Math.min.apply( null, arr );
        var temp_max = Math.max.apply( null, arr );


        if (temp_min < min)
        {
          min = temp_min
        }
        else if (temp_max > max)
        {
          max = temp_max
        }
      }

    })

    return [min, max]
  }

  // get values for a specific country and indicator
  function getObservation(country, variable, data)
  {

    // sort data per country
    var dataBycountry = d3.nest()
      .key(function(d) { return d["Country Name"]; })
        .entries(data);

    // store data for a specific country
    var countryData;
    dataBycountry.forEach(function(d){ if(d.key == country)
                                       {
                                         countryData = d.values
                                       }
                                    })
  // if no data, return nulll
  if (countryData == undefined)
  {

    return null
  }


  // sort countryData per indicator
  var countryData = d3.nest()
    .key(function(d){ return d["Indicator Name"]; })
      .entries(countryData)

  // store data from a country for a specific variable
  var variableData;
  countryData.forEach(function(d){ if (d.key == variable)
                                   {
                                     variableData = d.values
                                   }
                                })

  // store all the keys
  var keys = Object.keys(variableData[0])
  var outcome = []

  // return the requested data as a list of dicts
  keys.forEach(key => {
    if (Number.isInteger(parseFloat(variableData[0][key])))
    {

      var dict = {"year":parseYear(key),
                  "value":parseInt(variableData[0][key])}

      outcome.push(dict)
    }
  })

  return outcome

  }

  // function that updates the legend
  function updateLegend(colorScale)
  {
    var linear = colorScale;

    var legendLinear = d3.legendColor()
        .shapeWidth(30)
        .orient('vertical')
        .scale(linear);

    map.select(".legendLinear")
        .call(legendLinear);
  }

  // function that updates the linegraph
  function updateLinegraph(country, variable, data, x, y, remove){
    
    // get data to be depicted
    var total = getObservation(country, variable, data)

    // remove previous linegraph if need be
    if (remove == "True")
    {
      d3.selectAll(".axis").remove()
      d3.selectAll(".line").remove()
      d3.select(".linegraph-title").remove()
    }

    // if no observation, return alert
    if (total == null)
    {
      alert("No data at all available for " + country)
    }
    else
    {

      // scale the range of the data
      x.domain(d3.extent(total, function(d) { return d.year; }));
      y.domain([0, d3.max(total, function(d) { return d.value; })]);

      // add the X Axis
      map.append("g")
          .attr("class", "axis")
          .attr("transform", "translate(0," + 500  + ")")
          .call(d3.axisBottom(x));

      // add the Y Axis
      map.append("g")
          .attr("class", "axis")
          .attr("transform", "translate(" + 
            XadjustLinegraph + "," + YadjustLinegraph + 
            ")")
          .call(d3.axisLeft(y));

      // define the line
      var valueline = d3.line()
        .x(function(d) { return x(d.year); })
        .y(function(d) { return y(d.value); })

    // add the valueline path.
      map.append("path")
          .data([total])
          .attr("class", "line")
          .attr("d", valueline)
          .attr("transform", "translate(0," + YadjustLinegraph + ")")
      
      // add title of linegraph
      map.append("text")
          .attr("class", "linegraph-title")
          .text("Country: " + country + " - Variable: " + variable)
          .attr("transform", "translate(" + 
            XadjustLinegraph + "," + (YadjustLinegraph - 20) + 
            ")")
    }


  }

// function that updates the crosshair of the linegraph
function updateCrosshair(year, country, variable, data){

      // get X value and Y values for the crosshair
      var Xvalue = parseYear(year)
      var Yvalues = getObservation(country, variable, data)

      // get the specific Y value for crosshair
      var Yvalue;
      Yvalues.forEach(function(d){if (d.year.getFullYear() == year)
                                {
                                  Yvalue = d.value
                                }
                              })

      // don't display crosshair if no data
      if (Yvalues == null || Yvalue == undefined)
      {
        d3.selectAll(".crossline")
        .attr("display", "none")
      }
      else
      {
        // change the vertical line
        lineV
          .attr('x1', x(Xvalue))
          .attr('x2', x(Xvalue))
          .attr("display", function(d){ if (x(Xvalue) < XadjustLinegraph || x(Xvalue) > 150)
                                    {
                                      return "none"
                                    }
                                    else
                                    {
                                      return "inline"
                                    }
                                  })

        // change horizontal line
        lineH
          .attr('y1', y(Yvalue) + YadjustLinegraph)
          .attr('y2', y(Yvalue) + YadjustLinegraph)
          .attr("display", function(d){ if (x(Xvalue) < XadjustLinegraph || x(Xvalue) > 150)
                                      {
                                        return "none"
                                      }
                                      else
                                      {
                                        return "inline"
                                      }
                                    })
      }
    }


  // change the colours of the map
  function updateMap(map, data, variable, time, country)
  {
    // remove old colour of countries
    d3.selectAll(".countryFill").remove();

    // create new legend based on colorScale
    colorScale.domain(getMaxMin(data, variable));
    updateLegend(colorScale)

    // create new colours for countries
    map
      .enter().append("path")
      .attr("class", "countryFill")
      .attr("d", path)
      .style("fill", function(d){ return getColor(d, data, variable, time)})
      .on("click", function(d){  
        countryName =  String(d.properties["admin"])
        updateLinegraph(countryName, variable, data, x, y, "True")
        updateCrosshair(year, countryName, variable, data)
      })
      .on("mouseover", tip.show)
      .on("mouseout", tip.hide)

    // change the title of the page
    title
      .text(headline + year + "?")

  }

// function that creates the initial map 
function makemap(error, africa, data){
  if (error) throw error;
  
  // load in countries
  var countries = topojson.feature(africa, africa.objects.countries).features;

  // define domain colorscale
  colorScale.domain(getMaxMin(data, variable));

  // create path for each country
  var countries_map = map.append("g")
    .attr("class", "countries")
    .selectAll("path")
    .data(countries)
  
  // define attributes of each country
  countries_map
  .enter().append("path")
      .attr("class", "countryFill")
      .attr("d", path)
      .style("fill", function(d){ return getColor(d, data, variable, year)})
      .on("click", function(d){
        countryName = String(d.properties["admin"])
        updateLinegraph(countryName, variable, data, x, y, "True")
        updateCrosshair(year, countryName, variable, data)
    })
    .on("mouseover", tip.show)
    .on("mouseout", tip.hide)

  // crate the borders of each country
  var borders = map.append("g")
    .attr("class", "borders")
    .append("path")
    .datum(topojson.mesh(africa, africa.objects.countries, 
      function(a, b) { return a !== b; 
    }))
    .attr("d", path);
  
  // define the depicted variables
  var variables_map = [data[0]["Indicator Name"], data[1]["Indicator Name"]]
  
  // create dropdown menu when button is pressed
  var menu = button.append("ul")
      .attr("class", "dropdown-menu")
      .attr("role", "menu")

  // create dropdown menu for button
  menu.selectAll("li")
      .data(variables_map)
      .enter().append("li")
          .append("a")
          .attr("class", "m")
          .attr("href", "#")
          .text(function(d){ return d})
          .attr("value", function(d){ return d})


  // if option is selected, update graph 
  var option = d3.selectAll(".m")
    .on("click", function(){
      // get country clicked by user 
      variable = this.getAttribute("value")
      updateMap(countries_map, data, variable, year, countryName)
      updateLinegraph(countryName, variable, data, x, y, "True")
      updateCrosshair(year, countryName, variable, data)
    })

  // change graphs based on slider
  d3.select("#year").on("input", function() { 
      year = this.value
      updateMap(countries_map, data, variable, year, countryName)
      updateCrosshair(year, countryName, variable, data)
    })

  // create legend
  map.append("g")
    .attr("class", "legendLinear")
    .attr("transform", "translate(" + XadjustLinegraph+ ",10)");

  // define attributes of the legend
  var linear = colorScale;

  var legendLinear = d3.legendColor()
    .shapeWidth(30)
    .orient('vertical')
    .scale(linear);

  map.select(".legendLinear")
    .call(legendLinear)

  // add greyblock to legend
  map.append("g")
    .attr("class", "cell")
    .attr("id", "greyblock")
    .attr("transform", "translate(" + XadjustLinegraph + ", 95)")

  // define attributes greyblock
  map.select("#greyblock")
    .append("rect")
    .attr("width", 30)
    .attr("height", 15)
    .style("fill", "grey")

  // define text next to greyblock
  map.select("#greyblock")
    .append("text")
    .attr("class", "legend-text")
    .attr("transform", "translate(40, 12.5)")
    .text("No data available")

  // update linegraph and legend
  updateLinegraph(countryName, variable, data, x, y, "False")
  updateLegend(colorScale)

  }


}