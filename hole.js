function Hole(position, size) {
    this.pos = position;
    this.r = size;
    this.render = function(ctx) {
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.r, 0, 2*Math.PI);
        ctx.fillStyle = "black";
        ctx.fill();
    }
    this.checkBallOver = function(ball) {
        if (ball.pos.x < this.pos.x + this.r
            && ball.pos.x > this.pos.x - this.r
            && ball.pos.y < this.pos.y + this.r
            && ball.pos.y > this.pos.y - this.r) {
            return true;
        } else {
            return false;
        }
    }
}
