var canvas = document.getElementById("canvas");
var canvasoffset = 20;
canvas.style.background = "rgb(25,51,0)";
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var tableoffset = 40;
var table = new Table({x: tableoffset, y: tableoffset}, canvas.width-2*tableoffset, canvas.height-2*tableoffset, "darkgreen");
var context = canvas.getContext("2d");
var balls = [];
var ballsize = table.width / 70;
var ballweight = 0.2;
var timer;
var collisiondetected = false;
var mousedown = false;
var whiteball = new Ball({x: table.pos.x+table.width*3/4,y: table.pos.y+table.height/2}, 0, ballsize, "white", ballweight);
whiteball.cueball = true;
balls.push(whiteball);
var cue = new Cue(whiteball);
var mousedownevent;
var holes = [];
var holesize = ballsize * 1.4;
var frameRate = 1;
var removeindexes = [];
var shooting = false;
var target;
var event;
var ai = false;

document.body.scrollTop = 0;

document.addEventListener("keydown", function (e) {
    var key = String.fromCharCode(e.keyCode);
    if (key === "R") {
        restart();
    }
    if (key === "A") {
        ai = !ai;
    }
    if (e.keyCode === 189) {
        clearInterval(timer);
        frameRate += 10;
        timer = setInterval(draw, frameRate);
    }
    if (e.keyCode === 187) {
        clearInterval(timer);
        frameRate = (frameRate - 10 > 0 ? frameRate - 10 : 1);
        timer = setInterval(draw, frameRate);
    }
}, false);

window.onload = function() {
    initiateHoles();
    initiateTable();
    // generateBalls(10);
    timer = setInterval(draw, frameRate);
};

canvas.onmousemove = function(e) {
    if (mousedown && !ai) {
        mouseMoveEvent(e);
    }
};

function mouseMoveEvent(e) {
    mousedownevent = e;
}

canvas.onmousedown = function(e) {
    if (whiteball.checkMouseOver(e) && !ai) {
        mouseDownEvent(e);
    }
};

function mouseDownEvent(e) {
    mousedown = true;
    mousedownevent = e;
}

canvas.onmouseup = function(e) {
    if (mousedown && !ai) {
        mouseUpEvent(e);
    }
};

function mouseUpEvent(e) {
    mousedown = false;
    cue.applyForce(e);
}

canvas.addEventListener("touchstart", function(e) {
    var touches = e.changedTouches;
    canvas.onmousedown({x: touches[0].pageX, y: touches[0].pageY});
}, false);

canvas.addEventListener("touchmove", function(e) {
    var touches = e.changedTouches;
    e.preventDefault();
    canvas.onmousemove({x: touches[0].pageX, y: touches[0].pageY});
}, false);

canvas.addEventListener("touchend", function(e) {
    var touches = e.changedTouches;
    canvas.onmouseup({x: touches[0].pageX, y: touches[0].pageY});
}, false);

function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    table.render(context);
    removeindexes = [];
    for (var l = 0; l < holes.length; l++) {
        holes[l].render(context);
    }
    for (var i = 0; i < balls.length; i++) {
        for (var j = 0; j < balls.length; j++) {
            if (j !== i) {
                if (balls[i].checkCollision(balls[j])) {
                    if (!balls[i].colliding && !balls[j].colliding) {
                        balls[i].resolveCollision(balls[j]);
                        balls[i].colliding = true;
                        balls[j].colliding = true;
                    }
                } else {
                    balls[i].colliding = false;
                    balls[j].colliding = false;
                }
            }
        }
	    balls[i].render(context);
	    balls[i].checkEdges(table);
	    balls[i].update();
        for (var k = 0; k < holes.length; k++) {
            if (holes[k].checkBallOver(balls[i])) {
                if (balls[i] === whiteball) {
                    whiteball.pos = {x: table.pos.x+table.width*3/4,y: table.pos.y+table.height/2};
                    whiteball.vel = 0;
                } else {
                    removeindexes.push(i);
                }
            }
        }
    }
    for (var m = 0; m < removeindexes.length; m++) {
        balls.splice(removeindexes[m], 1);
    }
    if (mousedown) {
        cue.render(context, mousedownevent);
    }
    if (balls.length === 1 && ai) {
        restart();
    }
    if (shooting && ai) {
        var theta = Math.atan2(target.pos.y-whiteball.pos.y, whiteball.pos.x-target.pos.x);
        var str = canvas.width/10;
        if (balls.indexOf(target) === -1 && balls.length > 1) {
            var r = Math.floor(Math.random()*balls.length);
            while (balls[r] === whiteball) {
                r = Math.floor(Math.random()*balls.length);
            }
            target = balls[r];
            theta = Math.atan2(target.pos.y-whiteball.pos.y, whiteball.pos.x-target.pos.x);
            str = canvas.width/10;
            event.x = whiteball.pos.x+str*Math.cos(theta);
            event.y = whiteball.pos.y-str*Math.sin(theta);
        }
        event.x = whiteball.pos.x+str*Math.cos(theta);
        event.y = whiteball.pos.y-str*Math.sin(theta);
        mouseMoveEvent(event);
    }
    if (whiteball.vel === 0 && !shooting && ai) {
        mouseDownEvent({x: whiteball.pos.x, y: whiteball.pos.y});
        var r = Math.floor(Math.random()*balls.length);
        while (balls[r] === whiteball) {
            r = Math.floor(Math.random()*balls.length);
        }
        target = balls[r];
        var theta = Math.atan2(target.pos.y-whiteball.pos.y, whiteball.pos.x-target.pos.x);
        var str = canvas.width/10;
        event = new Event(whiteball.pos.x+str*Math.cos(theta), whiteball.pos.y-str*Math.sin(theta));
        mouseMoveEvent(event);
        shooting = true;
        setTimeout(function() {
            event.execute();
            shooting = false;
        }, 1000);
    }
}

function Event(x, y) {
    this.x = x;
    this.y = y;
    this.execute = function() {
        mouseUpEvent(this);
    }
}

function initiateTable() {
    balls.push(new Ball({x: table.pos.x+table.width/4,y: table.pos.y+table.height/2}, 0, ballsize, randomColor(), ballweight));

    balls.push(new Ball({x: table.pos.x+table.width/4-2*ballsize,y: table.pos.y+table.height/2+1.5*ballsize}, 0, ballsize, randomColor(), ballweight, true));
    balls.push(new Ball({x: table.pos.x+table.width/4-4*ballsize,y: table.pos.y+table.height/2+2.5*ballsize}, 0, ballsize, randomColor(), ballweight));
    balls.push(new Ball({x: table.pos.x+table.width/4-6*ballsize,y: table.pos.y+table.height/2+3.5*ballsize}, 0, ballsize, randomColor(), ballweight, true));
    balls.push(new Ball({x: table.pos.x+table.width/4-8*ballsize,y: table.pos.y+table.height/2+4.5*ballsize}, 0, ballsize, randomColor(), ballweight));

    balls.push(new Ball({x: table.pos.x+table.width/4-2*ballsize,y: table.pos.y+table.height/2-1.5*ballsize}, 0, ballsize, randomColor(), ballweight, true));
    balls.push(new Ball({x: table.pos.x+table.width/4-4*ballsize,y: table.pos.y+table.height/2-2.5*ballsize}, 0, ballsize, randomColor(), ballweight, true));
    balls.push(new Ball({x: table.pos.x+table.width/4-6*ballsize,y: table.pos.y+table.height/2-3.5*ballsize}, 0, ballsize, randomColor(), ballweight));
    balls.push(new Ball({x: table.pos.x+table.width/4-8*ballsize,y: table.pos.y+table.height/2-4.5*ballsize}, 0, ballsize, randomColor(), ballweight, true));

    balls.push(new Ball({x: table.pos.x+table.width/4-4*ballsize,y: table.pos.y+table.height/2}, 0, ballsize, "black", ballweight));
    balls[balls.length-1].eightball = true;

    balls.push(new Ball({x: table.pos.x+table.width/4-6*ballsize,y: table.pos.y+table.height/2+1.2*ballsize}, 0, ballsize, randomColor(), ballweight));
    balls.push(new Ball({x: table.pos.x+table.width/4-6*ballsize,y: table.pos.y+table.height/2-1.2*ballsize}, 0, ballsize, randomColor(), ballweight, true));

    balls.push(new Ball({x: table.pos.x+table.width/4-8*ballsize,y: table.pos.y+table.height/2-2.2*ballsize}, 0, ballsize, randomColor(), ballweight));
    balls.push(new Ball({x: table.pos.x+table.width/4-8*ballsize,y: table.pos.y+table.height/2+2.2*ballsize}, 0, ballsize, randomColor(), ballweight));
    balls.push(new Ball({x: table.pos.x+table.width/4-8*ballsize,y: table.pos.y+table.height/2}, 0, ballsize, randomColor(), ballweight, true));
}

function initiateHoles() {
    holes.push(new Hole({x: table.pos.x+holesize/3, y: table.pos.y+holesize/3}, holesize));
    holes.push(new Hole({x: table.pos.x+table.width/2, y: table.pos.y}, holesize));
    holes.push(new Hole({x: table.pos.x+table.width-holesize/3, y: table.pos.y+holesize/3}, holesize));
    holes.push(new Hole({x: table.pos.x+holesize/3, y: table.pos.y+table.height-holesize/3}, holesize));
    holes.push(new Hole({x: table.pos.x+table.width/2, y: table.pos.y+table.height}, holesize));
    holes.push(new Hole({x: table.pos.x+table.width-holesize/3, y: table.pos.y+table.height-holesize/3}, holesize));
}

function restart() {
    clearInterval(timer);
    balls = [];
    whiteball.pos = {x: table.pos.x+table.width*3/4,y: table.pos.y+table.height/2};
    whiteball.vel = 0;
    balls.push(whiteball);
    initiateTable();
    timer = setInterval(draw, frameRate);
}

function generateBalls(n) {
    for (var i = 0; i < n; i++) {
        balls.push(new Ball({x: randombetween(table.pos.x+ballsize, table.pos.x+table.width-ballsize),y: randombetween(table.pos.y+ballsize, table.pos.y+table.height-ballsize)}, randombetween(0, 0.8), ballsize, randomColor(), ballweight));
    }
}

function randombetween(min, max) {
    return Math.random() * (max - min) + min;
}

function randomColor() {
    var r = Math.round(Math.random()*256);
    var g = Math.round(Math.random()*256);
    var b = Math.round(Math.random()*256);
    return "rgb("+r+","+g+","+b+")";
}

