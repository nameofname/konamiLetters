function draw_circle() {
    var x, y; 
    for (x=-250; x<=250; x++) {
        y_arr = solve_y(x); 
        var x1 = x + 250; 
        var y1 = y_arr[0] + 250; 
        var y2 = y_arr[1] + 250; 
        plot_point(x1, y1); 
        plot_point(x1, y2); 
    }
}

function solve_y(x) {
    x = parseInt(x), arr = []; 
    var y1 = Math.sqrt(62500 - (x * x)); 
    var y2 = -1 * y1; 
    arr.push(y1); 
    arr.push(y2); 
    return arr; 
}

function plot_point(x, y) {
//    console.log('plot', x,y);
    var point = $('<span>'); 
    if (!isNaN(x) && !isNaN(y)) {
        point.addClass('point'); 
        point.html('.'); 
        point.css({left:x, bottom:y}); 
        var append = $('.circle').append(point); 
    }
}



$(document).ready(function(){
    draw_circle();
});

