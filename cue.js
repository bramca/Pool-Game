function Cue(ball) {
    this.ball = ball;
    this.render = function(ctx, mouse) {
        ctx.beginPath();
        ctx.moveTo(this.ball.pos.x, this.ball.pos.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.strokeStyle = "rgb(0,255,0)";
        ctx.stroke();
    }

    this.applyForce = function(mouse) {
        this.ball.theta = -Math.atan2(mouse.y - this.ball.pos.y, this.ball.pos.x - mouse.x);
        this.ball.vel = distance(this.ball.pos.x, this.ball.pos.y, mouse.x, mouse.y)/30;
    }

    function distance(x1, y1, x2, y2) {
        return Math.sqrt((x1 - x2)*(x1 - x2) + (y1 - y2)*(y1 - y2));
    }
}
