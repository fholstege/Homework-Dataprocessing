
d3.xml("test.svg", "image/svg+xml", function(error, xml) {
    if (error) throw error;    
    document.body.appendChild(xml.documentElement);   

    // create lists for colours and the amount of legenda points
   	var colour = ["#ccece6","#99d8c9","#66c2a4","#41ae76","#238b45","#005824"];
   	var data = ["1", "2", "3", "4", "5", "6"];
   	var text = ["100","1000", "10000", "100000", "1000000", "10000000"];
	
	// add data to rectangles on the left
	var left_rectangles = d3.select("svg").selectAll(".st1")
	  .data(data)

	// magic numer for y position of rectangles
	rectangle_y = 46

	// create additional rectangles on the left
	left_rectangles
		.enter().append("rect")
		.attr({"id": function(d, i){return "kleur" + data[i];},
			   "x":13,
			   "y": function(d, i){return 1.8 + (rectangle_y * i);},
			   "class":"st1",
			   "width":21,
			   "height":29
				});

	// fill colour of rectangles on the left
	left_rectangles
		.style("fill", function(d, i){
			return colour[i];
		})

	// add data to rectangles on the right
	var right_rectangles = d3.select("svg").selectAll(".st2")
		.data(data)

	// create additional rectangles on the right
	right_rectangles
		.enter().append("rect")
		.attr({"id": function(d, i){return "tekst" + data[i];},
			   "x":46.5,
			   "y": function(d, i){return 1.8 + (rectangle_y * i);},
			   "class":"st2",
			   "width": 119.1,
			   "height":29
				});

	// add text to rectangles on the right
	d3.select("svg").selectAll("text")
		.data(data)
		.enter()
		.append("text")
		.text(function(d, i){ return text[i]})
		.attr({"x":50,
			   "y":function(d, i){return 35 + (42.5 * i);}
		});

});




