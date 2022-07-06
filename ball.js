function Ball(position, velocity, radius, color, mass, striped) {
    this.pos = position;
    this.theta = 0;
    this.r = radius;
    this.color = color;
    this.m = mass;
    this.colliding = false;
    this.vel = velocity;
    this.cueball = false;
    this.striped = striped || false;
    this.eightball = false;
    var friction = 0.004;
    // this.velX = velocity * Math.cos(this.theta);
    // this.velY = velocity * Math.sin(this.theta);

    this.update = function() {
        this.vel = this.vel - friction > 0 ? this.vel - friction : 0;
	    // this.pos.x += this.velX;
	    // this.pos.y += this.velY;
        this.pos.x += this.vel * Math.cos(this.theta);
        this.pos.y += this.vel * Math.sin(this.theta);
    }

    this.render = function(ctx) {
	    ctx.beginPath();
	    ctx.arc(this.pos.x, this.pos.y, this.r, 0, 2*Math.PI);
	    ctx.fillStyle = this.color;
	    ctx.fill();
        if (this.cueball) {
            ctx.beginPath();
            ctx.arc(this.pos.x, this.pos.y, this.r/7, 0, 2*Math.PI);
            ctx.fillStyle = "red";
            ctx.fill();
        }
        if (this.striped) {
            ctx.beginPath();
            ctx.fillStyle = "white";
            ctx.arc(this.pos.x, this.pos.y, this.r, Math.PI/2, -Math.PI/2);
            ctx.fill();
        }
        if (this.eightball) {
            ctx.fillStyle = "white";
            ctx.font = this.r + "px Verdana";
            ctx.textAlign = "center";
            ctx.fillText("8", this.pos.x, Math.round(this.pos.y+this.r*0.45));
        }
    }

    this.checkEdges = function(table) {
        var dx = this.vel * Math.cos(this.theta);
        var dy = this.vel * Math.sin(this.theta);
        var changed = false;
	    if (this.pos.x+dx > table.pos.x+table.width-this.r || this.pos.x+dx < table.pos.x+this.r) {
            dx = -dx;
            changed = true;
	    }
	    if (this.pos.y+dy > table.pos.y+table.height-this.r || this.pos.y+dy < table.pos.y+this.r) {
            dy = -dy;
            changed = true;
	    }
        if (changed) {
            this.theta = Math.atan2(dy, dx);
        }
    }
    this.checkCollision = function(ball) {
        if (distance(ball.pos.x, ball.pos.y, this.pos.x, this.pos.y) <= this.r + ball.r + 0.4) {
            return true;
        } else {
            return false;
        }
    }

    this.resolveCollision = function(ball) {
        var phi = Math.atan2(this.pos.y - ball.pos.y, this.pos.x - ball.pos.x);
        var newVelX1 = this.vel * Math.cos(this.theta - phi) * (this.m - ball.m) + 2 * ball.m * ball.vel * Math.cos(ball.theta - phi) * Math.cos(phi) / (this.m + ball.m) + this.vel * Math.sin(this.theta - phi) * Math.cos(phi + Math.PI/2);
        var newVelY1 = this.vel * Math.cos(this.theta - phi) * (this.m - ball.m) + 2 * ball.m * ball.vel * Math.cos(ball.theta - phi) * Math.sin(phi) / (this.m + ball.m) + this.vel * Math.sin(this.theta - phi) * Math.sin(phi + Math.PI/2);
        var newVelX2 = ball.vel * Math.cos(ball.theta - phi) * (ball.m - this.m) + 2 * this.m * this.vel * Math.cos(this.theta - phi) * Math.cos(phi) / (ball.m + this.m) + ball.vel * Math.sin(ball.theta - phi) * Math.cos(phi + Math.PI/2);
        var newVelY2 = ball.vel * Math.cos(ball.theta - phi) * (ball.m - this.m) + 2 * this.m * this.vel * Math.cos(this.theta - phi) * Math.sin(phi) / (ball.m + this.m) + ball.vel * Math.sin(ball.theta - phi) * Math.sin(phi + Math.PI/2);

        this.theta = Math.atan2(newVelY1, newVelX1);
        ball.theta = Math.atan2(newVelY2, newVelX2);
        this.vel = Math.sqrt(newVelX1 * newVelX1 + newVelY1 * newVelY1);
        ball.vel = Math.sqrt(newVelX2 * newVelX2 + newVelY2 * newVelY2);
        this.update();
        ball.update();
    }

    this.checkMouseOver = function(mouse) {
        if (mouse.x < this.pos.x + this.r
            && mouse.x > this.pos.x - this.r
            && mouse.y < this.pos.y + this.r
            && mouse.y > this.pos.y - this.r){
            return true;
        } else {
            return false;
        }
    }

    function distance(x1, y1, x2, y2) {
        return Math.sqrt((x1 - x2)*(x1 - x2) + (y1 - y2)*(y1 - y2));
    }
}
