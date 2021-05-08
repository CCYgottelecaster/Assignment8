//https://wiki.jikexueyuan.com/project/d3wiki/chart.html
// Adding event listener to different buttons when the window is loaded
window.addEventListener('load', function () {
    var foodButtons = document.getElementsByClassName('buttons');
    for (var i = 0; i < foodButtons.length; i++) {
        foodButtons[i].addEventListener("click", foodClicked);
    }
    var submitButton = document.getElementsByClassName('submit')[0];
    submitButton.addEventListener("click", newFood);
})

// Adding a new food's name in the input box when a food button is clicked
function foodClicked(event) {
    var foodName = document.getElementById("foodName");
    var thisButton = event.target;
    if (thisButton.className == 'foodButton'||thisButton.className == 'foodImg') {
        if (thisButton.childNodes.length != 0) {
            foodName.value = thisButton.childNodes[1].alt;
        } else {
            foodName.value = thisButton.alt;
        }
    }
    
}
// Food list in the options
const foodList = ['chicken', 'bubble tea', 'hot dog', 'pineapple', 'pizza',
                    'ice cream', 'popsicle', 'watermelon', 'apple', 'hamburger', 'cake'];
// Ingredient list
const nutrition = ['Calories (kJ)', 'Total Fat (g)', 'Carbohydrate (g)', 'Protein (g)', 'Sodium (mg)', 'Vitamin (mg)'];

// Differentn ingredients of different food per 100g
const nutritionList = [[167, 9.6, 1.4, 18.5, 72.4, 48],
                        [52.48, 0.52, 12, 0.31, 8, 0],
                        [250, 14.8, 18.4, 10.6, 684, 1],
                        [41, 0.1, 10.8, 0.5, 0.8, 22],
                        [268, 12.3, 29, 10.4, 447, 75],
                        [127, 5.3, 17.3, 2.4, 54, 50],
                        [47, 0.2, 10.5, 0.8, 20.4, 0.1],
                        [0.025, 0.1, 5.8, 0.6, 3.2, 7],
                        [52, 0.2, 13.5, 0.2, 1.6, 6.5],
                        [269, 13.6, 23.8, 13.9, 350, 0],
                        [364, 16.4, 53.4, 4, 193, 4]];

// The constructor of Food
function Food(name, amount, color) {
    this.name = name;
    this.amount = amount;
    this.color = color;
}

// The object of the newly added food
var newfood;
// The function to transfer the food name and amount to d3 diagram
function newFood(event) {
    var addName = document.getElementById("foodName").value;
    var addAmount = document.getElementById("amount").value;
    var getRandomColor = function(){    
        return  '#' + (function(color){    
             return (color +=  '0123456789abcdef'[Math.floor(Math.random()*16)])    
             && (color.length == 6) ?  color : arguments.callee(color);    
        })('');    
     } 
    newfood = new Food(addName, addAmount, getRandomColor());
    drawRect(newfood);
    document.getElementById("foodName").value = null;
    document.getElementById("amount").value = null;
}

// Size of the canvas
var width = 700;
var height = 592;
// Total serving amount
var total = [0, 0, 0, 0, 0, 0];
var svg = d3.select(".diagram")
    .append("svg")
    .attr("width", width)
    .attr("height", height);
var padding = {left:50, right:30, top:50, bottom:50};

// Scale of x axis
var xScale = d3.scaleBand()
    .domain(d3.range(6))
    .rangeRound([0, width - padding.left - padding.right]);

// Scale of x axis
var xAxis = d3.axisBottom()
            .scale(xScale)
            .tickFormat(function(d, i){
                return nutrition[i];
            });
// Setting a y scale and axis
var yScale;
var yAxis;
// The height and padding of the rectangles
var rectHeight = 25;
var rectPadding = 4;

// Drawing the rectangles
function drawRect(food) {
    // Calculating the amount of the food
    var amount = food.amount/100;
    var thisFoodList = nutritionList[foodList.indexOf(food.name)];
    var color = food.color;

    // Iterating the ingredients of this food and adding them to the total
    for (let i = 0; i < thisFoodList.length; i++) {
        thisFoodList[i] = thisFoodList[i]*amount;
        total[i] += thisFoodList[i];
        total[i] = Math.floor(total[i] * 100) / 100;
    }

    // Renewing the yscale
    yScale = d3.scaleLinear()
        .domain([0,d3.max(total)])
        .range([height - padding.top - padding.bottom, 0]);
    yAxis = d3.axisLeft(yScale);
    
    // Deleting the rectangles drew last time
    svg.selectAll("rect").remove();
    svg.selectAll(".MyText").remove();
    // Drawing the rectangles of total serving amount
    var rects = svg.selectAll("rect")
        .data(total)
        .enter()
        .append("rect")
        .attr("class", "MyRect")
        .attr("transform","translate(" + padding.left + "," + padding.top + ")")
        .attr("x", function(d,i){
            return xScale(i) + rectPadding/2;
        } )
        .attr("y",function(d, i){
            return yScale(d);
        })
        .attr("width", xScale.bandwidth() - rectPadding )
        .attr("height", function(d){
            return height - padding.top - padding.bottom - yScale(d);
        })
        .attr("fill", "grey");

    // Drawing the rectangles of the current food ingredients
    var newrects = svg.selectAll("newrect")
        .data(thisFoodList)
        .enter()
        .append("rect")
        .attr("class", "rect")
        .attr("transform","translate(" + padding.left + "," + padding.top + ")")
        .attr("x", function(d,i){
            return xScale(i) + rectPadding/2;
        } )
        .attr("y",function(d, i){
            return yScale(d);
        })
        .attr("width", xScale.bandwidth() - rectPadding )
        .attr("height", function(d){
            return height - padding.top - padding.bottom - yScale(d);
        })
        .attr("fill", color);

    // Drawing the total serving ingredients on each rectangles
    var texts = svg.selectAll(".MyText")
        .data(total)
        .enter()
        .append("text")
        .attr("class","MyText")
        .attr("transform","translate(" + padding.left + "," + padding.top + ")")
        .attr("x", function(d,i){
            return xScale(i) - 5 + rectPadding/2 - 10;
        } )
        .attr("y",function(d){
            return yScale(d) - 30;
        })
        .attr("dx",function(){
            return (xScale.bandwidth() - rectPadding)/2;
        })
        .attr("dy",function(d){
            return 20;
        })
        .text(function(d, i){
            return total[i];
        });

    // Deleting the y axis drew last time
    svg.selectAll("g").remove();

    // Adding a y axis
    svg.append("g")
        .attr("class","axis")
        .attr("transform","translate(" + padding.left + "," + padding.top + ")")
        .call(yAxis);

    // Adding a x axis
    svg.append("g")
        .attr("class","axis")
        .attr("transform","translate(" + padding.left + "," + (height - padding.bottom) + ")")
        .call(xAxis)
        .selectAll("text")
        .attr("y", 20)
        .attr("transform", "rotate(-20)"); 
}







