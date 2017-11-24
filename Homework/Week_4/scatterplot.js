/*
 * Floris Holstege - 12002151 
 * Homework week 4
 * Creates a scatterplot using D3
 */

d3.json("FinalDataScatter.json", function(data){

	// define margins scatterplot
	var margin = {top: 20, right: 20, bottom: 30, left: 150},
    width = 1100 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

	// create svg for scatterplot
    var scatter = d3.select("body").append("svg")
	    .attr({"width": width + margin.left + margin.right,
	           "height": height + margin.top + margin.bottom})
	  .append("g")
    	.attr("transform","translate("+ margin.left + "," + margin.top +")");

    // create scale for X axis
    var scale_x = d3.scale.linear()
    	.range([0, width])
    	.domain(d3.extent(data,function(d){return d.GDPperCapita;})).nice();

    // create object for X axis
    var xAxis = d3.svg.axis()
    	.scale(scale_x)
    	.orient("bottom");

    // create scale for Y axis
    var scale_y = d3.scale.linear()
    	.range([height, 0])
    	.domain(d3.extent(data,function(d){return d.GHperCapita;})).nice();

    // create object for Y axis
	var yAxis = d3.svg.axis()
    	.scale(scale_y)
    	.orient("left");

    // append X axis to SVG
    scatter.append("g")
      .attr({"class": "axis",
      		"transform": "translate(0," + height + ")"})
      	.call(xAxis)
      .append("text")
      .attr({"class": "label",
      		 "x": width,
      		 "y": -6,
      		 "text-anchor": "end"})
      .text("GDP per capita (in constant $)")
      

    // append Y axis to SVG
    scatter.append("g")
      .attr("class", "axis")
      	.call(yAxis)
      .append("text")
      .attr({"class": "label",
      	     "transform": "rotate(-90)",
      		 "y": 10,
      		 "x": (-height + 10),
      	     "dy": ".35em",
      		 "text-anchor": "start"})
      .text("GreenHouse emissions (tonnes per capita)")

    // create tooltip
    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d) {
          return "<span>" + d.Country + ",  \
          Population: " + d.Population+ " Million </span>";
        })

    scatter.call(tip);

    // create initial attributes for circle
    var circleInitial = {
    	"class":"dot", 
	  	"cx": 0,
	  	"cy": 0,
	  	"r": 3.5,
	  	"fill": "black"
    }

    // define colours for circles
    var colours = ["green","orange","red"];

    // create scale for circles based on population 
    var scale_circle = d3.scale.linear()
    	.range([5,35])
    	.domain(d3.extent(data,function(d){return d.Population; })).nice();

    // create attributes for circle after transition 
    var circleAttributes = {
    	"class":"dot", 
	  	"cx": function(d, i) {return scale_x(d.GDPperCapita);},
	  	"cy": function(d, i) {return scale_y(d.GHperCapita); },
	  	"r": function(d, i) {return scale_circle(d.Population);},
	  	"fill": function(d, i) { if (d.GHTotal < 50)
	  							{
	  								return colours[0]
	  							}
	  							else if (d.GHTotal > 50 && d.GHTotal < 200)
	  							{
	  								return colours[1]
	  							}
	  							else
	  							{
	  								 	return colours[2]
	  							}
	  						}
    					}			

    // create circles 
    var circles = scatter.selectAll(".dot")
      .data(data)
      .enter().append("circle")
      .attr(circleInitial)
	  .on("mouseover", function(d){
            tip.show(d);
        })
	  .on("mouseout", function(d){
            tip.hide(d);
        });

	// create transition for circles 
	circles.transition()
		.duration(2000)
        .delay(function(d,i){ return i * 50;})
        .attr(circleAttributes)


    // create labels for legend
	var labels = ["Less than 50 million tonnes",
				  "Between 50 and 200 million tonnes",
				  "More than 200 million tonnes"]

	// attach data for legend
	var legend = scatter.selectAll(".legend")
      .data(labels)
    .enter().append("g")
      .attr({"class": "legend",
      	     "transform":function(d, i) {return "translate(0," + i * 20 + ")";}
      	 });

  // create rectangles for legend
  legend.append("rect")
      .attr({"x": 30,
      	     "y": 15,
      	     "width": 18,
      	     "height": 18})
      .style("fill",function(d, i){return colours[i]});

  // create text next to rectangles legend
  legend.append("text")
      .attr({"x": 50,
      	     "y": 25,
      		 "dy": ".35em",
      		 "class": "description"})
      .text(function(d) { return d; });

  // create title of legend
  scatter.append("g")
  	  .append("text")
  	  .attr({"x": 30,
  	  	     "y": 5,
  	 		 "dy": ".35em",
  	 		 "class": "title"})
  	  .text("Total Greenhouse gas emissions");

})
  
      




