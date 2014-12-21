function relMouseCoords(e) {

    var totalOffsetX = 0;
    var totalOffsetY = 0;
    var canvasX = 0;
    var canvasY = 0;
    var currentElement = this;

    do {
        totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
        totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
    }
    while (currentElement = currentElement.offsetParent)

    canvasX = event.pageX - totalOffsetX;
    canvasY = event.pageY - totalOffsetY;

    return { x: canvasX, y: canvasY }
    
}

    HTMLCanvasElement.prototype.relativeMouseCoords = relMouseCoords;
    

    function init() {

        var ctx1 = document.querySelector("#canvas1").getContext("2d");
        var oldx, oldy, wi = 100, he = 100;

        ctx1.fillStyle = "rgba(50,140,200,0.2)";
        ctx1.fillRect(0, 0, 300, 200);
        var img = ctx1.getImageData(0, 0, 300, 200);


        canvas1.onmousemove = function (e) {
            img.w = 300;
            img.h = 200;
            ctx1.clearRect(0, 0, 300, 200);
            img.drawCircle(200, 100, 50, img);
            ctx1.putImageData(img, 0, 0);
        }

        img.drawCircle = function (xc, yc, rad) {
            var x = rad;
            var y = 0;
            var xChange = 1 - 2 * rad;
            var yChange = 1;
            var radiusError = 0;
            while (x >= y) {
                this.plotCircleLine(xc, yc, x, y);
                y++;
                radiusError = radiusError + yChange;
                yChange = yChange + 2;
                if (2 * radiusError + xChange > 0) {
                    x--;
                    radiusError = radiusError + xChange;
                    xChange = xChange + 2;
                }
            }
        }


        img.plot = function (x, y) {
            if (x < 0 || x >= this.w || y < 0 || y >= this.h) return; var i = 4 * (this.w * y + x)
            this.data[i] = 0
            this.data[i + 1] = 0;
            this.data[i + 2] = 0;
            this.data[i + 3] = 255;
        }

        img.plotCircleLine = function (xc, yc, x, y) { this.plot(xc + x, yc + y); this.plot(xc + x, yc - y); this.plot(xc - x, yc + y); this.plot(xc - x, yc - y); this.plot(xc + y, yc + x); this.plot(xc + y, yc - x); this.plot(xc - y, yc + x); this.plot(xc - y, yc - x); }

        img.drawLine = function (xo, yc, x, y) {
            this.plot(xc + x, yc + y);
            this.plot(xc + x, yc - y);
            this.plot(xc - x, yc + y);
            this.plot(xc - x, yc - y);
            this.plot(xc + y, yc + x);
            this.plot(xc + y, yc - x);
            this.plot(xc - y, yc + x);
            this.plot(xc - y, yc - x);
        }




    }

