/*
 * Floris Holstege - 12002151 
 * Homework week 5
 * Creates a linegraph using D3
 */

// define margins scatterplot
var margin = {top: 20, right: 20, bottom: 30, left: 150},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

    // create scale for X axis
var scale_x = d3.time.scale()
    .range([0, width])

  	// create scale for Y axis
var scale_y = d3.scale.linear()
    .range([height, 0])

	// create object for X axis
var x_axis = d3.svg.axis()
	.scale(scale_x)
	.orient("bottom");

  	// create object for Y axis
var y_axis = d3.svg.axis()
    .scale(scale_y)
    .orient("left");

// turns number into date
var time_parse = d3.time.format("%Y").parse;

// create function to format time when data loaded
var format_time = function(data){
    	data.forEach(function(d){d.Year = time_parse(d.Year)})
    }

  // function to display crosshair
  var crosshair_display = function(){

    // get position of mouse
    position_mouse = d3.mouse(this)
      
      // change vertical line 
      lineV
        .attr('x1', position_mouse[0])
        .attr('x2', position_mouse[0])
        .attr("display", "inline")

     // change horizontal line
     lineH  
      .attr('y1', position_mouse[1])
        .attr('y2', position_mouse[1])
        .attr("display", "inline")

      var GDP = scale_y.invert(position_mouse[1])
      var date = scale_x.invert(position_mouse[0])

      // change horizontal label
      labelH
        .attr('display', "inline")
        .attr('y', position_mouse[1])
        .text("GDP per capita = " + Math.round(GDP))

      // change vertical label 
      labelV
        .attr('display', "inline")
        .attr('x', position_mouse[0])
        .text("Year: " + date.getFullYear())
  }

  // function to remove crosshair
  var crosshair_removal = function(){
        lineV
        .attr("display", "none")
        lineH
        .attr("display", "none")
        labelH
        .attr("display", "none")
        labelV
        .attr("display", "none")
  }


   

window.onload = function(d){

  // create svg for linegraph
  var linegraph = d3.select("body").append("svg")
        .attr({"width": width + margin.left + margin.right,
              "height": height + margin.top + margin.bottom})
        .append("g")
          .attr("transform","translate("+ margin.left + "," + margin.top +")");

  var create_legend = function(){

     // add legend
    legend = linegraph.selectAll(".legend")
      .data(countries)
    .enter().append("g")
      .attr({"class": "legend",
             "transform":function(d, i) {return "translate(0," + i * 20 + ")";}
         });

    // add rects for legend
    legend.append("rect")
      .attr({"x": 30,
             "y": 15,
             "width": 18,
             "height": 18})
      .style("fill",function(d, i){return colours[i]});

    // add text for legend
    legend.append("text")
      .attr({"x": 50,
             "y": 25,
           "dy": ".35em",
           "class": "description"})
      .text(function(d){ return d});
  }

    // create menu to select country
    var button = d3.select("body").append("div")
    		.attr("class", "menu")
    	.append("button")
    		.attr("type", "button")
    		.attr("class", "button")
    		.attr("data-toggle", "dropdown")
    		.text("Pick a country!")

   	// when button clicked, dropwdown menu opens
    button
    	.on("click", function(d){ d3.selectAll(".option")
    							    .style("display", "block")})

    // create horizontal line of crosshair
    lineH = linegraph.append("line")
        	.attr('class', 'crossline')
            .attr('x1', scale_x.range()[0])
            .attr('x2', scale_x.range()[1])
            .attr("stroke-width", 2)
	        .attr("stroke", "black")
	        .attr("display", "none");

  	// create vertical line of crosshair
  	lineV = linegraph.append("line")
        	.attr('class', 'crossline')
          .attr('y1', scale_y.range()[0])
          .attr('y2', scale_y.range()[1])
          .attr("stroke-width", 2)
	        .attr("stroke", "black")
	        .attr("display", "none");

  	// create pop-up that appears along horizontal line
  	labelH = linegraph.append("text")
        .attr('class', 'labelH')
        .attr('x', scale_x.range()[1])
        .attr('style', 'text-anchor: end')
        .attr('display', 'none');

    // create pop-up that appears along vertical line 
    labelV = linegraph.append("text")
        .attr('class', 'labelV')
        .attr('y', scale_y.range()[0])
        .attr('style', 'text-anchor: end')
        .attr('display', 'none');

var countries = []
var colours = ["red", "green", "blue", "orange", "yellow", "purple", "teal",
                 "cyan", "magneta", "brown", "lime", "maroon", "black", "pink"]

// load in data 
d3.json("MENA_data.json", function(error, data){

  // check if data is loaded 
  if (error)
  {
    throw error;
  }

    // format data to dates 
	format_time(data)

	// determine domain for X axis
    scale_x
    	.domain(d3.extent(data,function(d){return d.Year;})).nice();

    // determine domain for Y axis
    scale_y
    	.domain(d3.extent(data,function(d){return d.GDPperCapita;})).nice();

	 // append X axis to SVG
    linegraph.append("g")
      .attr({"class": "x_axis",
             "transform": "translate(0," + height + ")"})
        .call(x_axis)
      .append("text")
      .attr({"class": "label",
           "x": width,
           "y": -6,
           "text-anchor": "end"})
      .text("Year")

    // append Y axis to SVG
    linegraph.append("g")
      .attr("class", "y_axis")
        .call(y_axis)
      .append("text")
      .attr({"class": "label",
             "transform": "rotate(-90)",
           "y": 10,
           "x": -175,
             "dy": ".35em",
           "text-anchor": "start"})
      .text("GDP per Capita (constant US $ 2000)")

    // format data into point on line
    var line = d3.svg.line()
	    .x(function(d) { return scale_x(d.Year); })
	    .y(function(d) { return scale_y(d.GDPperCapita); });

	// create list that separates data for each country
	var data_bycountry = d3.nest()
		.key(function(d) { return d.Country; })
  		.entries(data);

  	// create dropdown menu when button is pressed
    var options = button.selectAll("ul")
    	.attr("class", "dropdown")
  		.data(data_bycountry)
    	.enter().append("li")
    		.attr("class", "option")
        	.style("display", "none")
    		.attr("value", function (d,i){ return String(d.key)})
    		.text(function (d,i){ return String(d.key)})


  const remove_array_item = (arr, itemToRemove) => {
  return arr.filter(item => item !== itemToRemove)
}

  // function to update graph
  var update_graph = function(){

    // remove all previous graph 
    linegraph.selectAll(".line").remove()
    linegraph.selectAll(".legend").remove()

    // get country clicked by user 
    var country = this.getAttribute("value");
    
    // add/remove country to array of displayed countries
    if (countries.includes(country))
    {
        var index = countries.indexOf(country)
        countries.splice(index, 1)
    }
    else
    {
      countries.push(country);
    }
    
    // create lists for display
    var axis_data = []
    var lines = []

    // store each country in lists for display
    for (i = 0; i < countries.length; i++)
    {
  
       var placeholder = data_bycountry.find(item => item.key == countries[i])
       
       lines.push(placeholder)
       axis_data = axis_data.concat(placeholder.values)

    }
  
    // determine domain for X axis
    scale_x
    .domain(d3.extent(axis_data,function(d){return d.Year;})).nice();

    // determine domain for Y axis
    scale_y
    .domain(d3.extent(axis_data,function(d){return d.GDPperCapita;})).nice();

    var svg = d3.select("body").transition();

    // change the x axis
    svg.select(".x_axis") 
      .duration(750)
      .call(x_axis)
    
    // change the y axis
    svg.select(".y_axis") 
      .duration(750)
      .call(y_axis)

    // add lines 
    linegraph.selectAll(".line")
      .data(lines)
      .enter().append("path")
      .attr("class", "line")
      .attr("d", function(d){ return line(d.values);})
      .on("mouseover", function(){ 
        crosshair_display.call(this)
        })
      .on("mouseout", function(){
        crosshair_removal()
        })
      .style("stroke", function(d,i){ return colours[i]})

   // appeal function to create legend
   create_legend(countries)

  }

 	// if option is selected, update graph 
  var option = d3.selectAll(".option")
		.on("click", function(){
			update_graph.call(this) 
		})

  })
}
