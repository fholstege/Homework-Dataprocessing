/*
 * Floris Holstege - 12002151 
 * Homework week 3 
 * Creates a barplot using D3
 */

// define lists to store data
var data_renewables = [],
    data_nations = [];

// define margins of the barplot
var margin = {top: 20, right: 30, bottom: 100, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// access dataset
d3.json("renewable_data_final.json", function(data){

    // store data from dataset in lists
	for (i = 0; i < data.length; i++)
	{
	  data_renewables.push(data[i].Renewable);
	  data_nations.push(data[i].Nation)
	}

    // create scale to determine height of bars
	var scale = d3.scale.linear()
	    .domain([0, d3.max(data_renewables)])
	    .range([height, 0]);

    // determine size of barplot
	var chart = d3.select(".chart")
	    .attr({"width": width + margin.left + margin.right,
	           "height": height + margin.top + margin.bottom})
	  .append("g")
    	.attr("transform", 
              "translate(" + margin.left + "," + margin.top + ")");

    // calculate width of bars
	var barWidth  = width / data_renewables.length;

    // attach data to elements
	var bar = chart.selectAll("g")
        .data(data_renewables)
      .enter().append("g")
        .attr("transform", function(d, i) { 
            return "translate(" + i * barWidth + ",0)"; 
        });

    // create tooltip
    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d) {
          return "<span>" + d+ "% </span>";
        })

    // initiate tooltip
    chart.call(tip);

    // create bars for barplot
	bar.append("rect")

        // when mouse hovers over, changes colour and shows data
        .on("mouseover", function(d){
            changecolour.call(this, "green");
            tip.show(d);
        })

        // when mouse has left, original colour and no data is depicted
        .on("mouseout", function(d){
            changecolour.call(this, "steelblue")
            tip.hide(d)
        })
        .attr({"height": 0,
               "y": height})

        // ensure transition when user opens page
        .transition().duration(1000)
        .delay(function(d,i){ return i * 50;} )

        // set bars to appropriate height
	    .attr({"y": function(d) {return scale(d);},
      	       "height": function(d) {return height - scale(d);},
      	       "width": barWidth - 1 });

    // function to change colour of element
    function changecolour(colour){
        d3.select(this).style("fill", colour)
    };

    // create scale for X axis
    var XaxisScale = d3.scale.ordinal()
    	.domain(data_nations)
        .rangeRoundBands([0, width], .1);

    // create object for X axis
    var xAxis = d3.svg.axis()
    	.scale(XaxisScale)
    		.ticks(30)
    	.orient("bottom");

    // add x axis to SVG
    chart.append("g")
    	.attr("transform", "translate(0," + height + ")")
    	.call(xAxis)
        .selectAll("text")
        .attr({"transform": "rotate(60)",
               "dx": "3.75em",
               "dy": "1.25em"
           })

    // create scale for Y axis
    var YaxisScale = d3.scale.linear()
    	.domain([d3.max(data_renewables),0])
    	.range([0,height]);

    // create object for Y axis
    var yAxis = d3.svg.axis()
    	.scale(YaxisScale)
    	.orient("left");

    // add y axis to SVG
    chart.append("g")
    	.call(yAxis)
    	
})