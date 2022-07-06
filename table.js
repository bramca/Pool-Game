function Table(position, width, height, color) {
    this.pos = position;
    this.width = width;
    this.height = height;
    this.color = color;

    this.render = function(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.pos.x, this.pos.y, this.width, this.height);
    }
}
