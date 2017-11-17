// create lists for the dates and the average temperature
var dates = [];
var average_temp = [];

var data = document.getElementById('rawdata').innerHTML.split("\n");

// iterate through data
for (i = 1; i < data.length; i++)
{
	// create javascript data for each day 
	var year = data[i].substring(0,4);
	var month = data[i].substring(4,6);
	var day = data[i].substring(6,8);
	var date = new Date(year, month - 1, day);

	// store dates and average temperature in lists
	dates.push(date);
	average_temp.push(Number(data[i].slice(9)));
}

// initiate canvas 
var canvas = document.getElementById('graph'); 
var ctx = canvas.getContext('2d')

// define height graph
height_graph = 300

// define domain and rage
var maximum = Math.max.apply(null, average_temp)
var minimum = Math.min.apply(null, average_temp)

domain = [minimum, maximum]
range = [0, height_graph]

function createTransform(domain, range){

    var domain_min = domain[0]
    var domain_max = domain[1]
    var range_min = range[0]
    var range_max = range[1]

    // formulas to calculate the alpha and the beta
   	alpha = (range_max - range_min) / (domain_max - domain_min)
    beta = range_max - alpha * domain_max

    // returns the function for the linear transformation (y= a * x + b)
    return function(x){
      return alpha * x + beta;
    }
}

// transformer determines the y for value x 
transformer = createTransform(domain, range)

// set criteria for the linegraph
ctx.strokeStyle = 'black'
ctx.lineWidth = 1
perdays_point = 1
ypoint_cornergraph = 360
xpoint_cornergraph = 100
positioning_linegraph = 50

// create linegraph 
for (i = 0, j = dates.length; i < j; i+= perdays_point)
{	
	ctx.beginPath();
	ctx.moveTo((i + xpoint_cornergraph), 
			  (height_graph + positioning_linegraph) -
			  transformer(average_temp[i]));
	ctx.lineTo((i + xpoint_cornergraph + perdays_point), 
			  (height_graph + positioning_linegraph) - 
			  transformer(average_temp[i + perdays_point]));
	ctx.stroke();
}

// create x Axis 
ctx.beginPath();
ctx.moveTo(xpoint_cornergraph, ypoint_cornergraph)
ctx.lineTo(xpoint_cornergraph + dates.length, ypoint_cornergraph)
ctx.stroke();

// create array with months
var month = new Array();
month[0] = "Jan";
month[1] = "Feb";
month[2] = "Mar";
month[3] = "Apr";
month[4] = "May";
month[5] = "Jun";
month[6] = "Jul";
month[7] = "Aug";
month[8] = "Sept";
month[9] = "Oct";
month[10] = "Nov";
month[11] = "Dec";

// set criteria for y axis
var counter = dates[0].getMonth();
marker_size = 10
text_spot = 30

// put down markers on axis for each month 
for (i = xpoint_cornergraph; i < xpoint_cornergraph + dates.length; i ++)
{	
	// ensure markers appear for first of each month
	if (counter == dates[i-xpoint_cornergraph].getMonth())
	{
		counter ++;
		ctx.beginPath();
		ctx.moveTo(i, ypoint_cornergraph)
		ctx.lineTo(i, ypoint_cornergraph + marker_size)
		ctx.fillText(month[dates[i - xpoint_cornergraph].getMonth()],
					i, ypoint_cornergraph + text_spot)
		ctx.stroke();
	}	
}

// determine length y axis
length_yaxis = 320

// create y Axis 
ctx.beginPath();
ctx.moveTo(xpoint_cornergraph, ypoint_cornergraph)
ctx.lineTo(xpoint_cornergraph, ypoint_cornergraph - length_yaxis)
ctx.stroke();

// set criteria for markers
amount_markers = 8
unit_temperature = Math.round(length_yaxis / amount_markers)
highest_marker = Math.ceil((maximum + 1)/10)*10;
adjustment = ypoint_cornergraph - highest_marker

for (i = ypoint_cornergraph - length_yaxis; i <= ypoint_cornergraph; i ++)
{
	if (i % unit_temperature == 0)
	{
		ctx.beginPath();
		ctx.moveTo(xpoint_cornergraph, i)
		ctx.lineTo(xpoint_cornergraph - marker_size, i)
		ctx.fillText(i - adjustment, 
					xpoint_cornergraph - text_spot,
					ypoint_cornergraph - i + unit_temperature);
		ctx.stroke();
	}
}

// create vertical text to indicate unit of y-axis
// credit: https://stackoverflow.com/a/5400970/7322016
 
 ctx.save();
 ctx.translate(40, 240);
 ctx.rotate(-Math.PI/2);
 ctx.textAlign = "center";
 ctx.font = 'italic 12pt Calibri';
 ctx.fillText("Temperatuur in 0.1 celsius", 50, 0);
 ctx.restore();




















