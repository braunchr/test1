
// constructor
function ImageBit (imgData, wi, he, x1, y1, x2) {

    this.imgData = imgData;
    this.width = wi;
    this.height = he;
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.xSide = this.x2 - this.x1;
    this.pixOverX = this.width / this.xSide;

};

   
    //*************************************************************
    //this function draws a circle with xc, yc and rad in pixels
    //*************************************************************
    ImageBit.prototype.drawCircle = function (xc, yc, rad,r,g,b) {
        var x = rad;
        var y = 0;
        var xChange = 1 - 2 * rad;
        var yChange = 1;
        var radiusError = 0;
        while (x >= y) {
            this.setPixel(xc + x, yc + y, r, g, b);
            this.setPixel(xc + x, yc - y, r, g, b);
            this.setPixel(xc - x, yc + y, r, g, b);
            this.setPixel(xc - x, yc - y, r, g, b);
            this.setPixel(xc + y, yc + x, r, g, b);
            this.setPixel(xc + y, yc - x, r, g, b);
            this.setPixel(xc - y, yc + x, r, g, b);
            this.setPixel(xc - y, yc - x, r, g, b);
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
    

    //*************************************************************
    //this function fills a black circle centred xc, yc and rad in pixels
    //*************************************************************
    ImageBit.prototype.fillDisk = function (xc, yc, rad , r,g,b) {
        var x = rad;
        var y = 0;
        var xChange = 1 - 2 * rad;
        var yChange = 1;
        var radiusError = 0;
        while (x >= y) {
            this.fillCircleLine(xc, yc + y, x, r, g, b);
            this.fillCircleLine(xc, yc - y, x, r, g, b);
            this.fillCircleLine(xc, yc + x, y, r, g, b);
            this.fillCircleLine(xc, yc - x, y, r, g, b);

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


    ImageBit.prototype.setPixel = function (i, j, r, g, b) {
        if (i < 0 || i >= this.width || j < 0 || j >= this.height) return;
        var index = 4 * (this.width * j + i)
        this.imgData.data[index] = r;
        this.imgData.data[index + 1] = g;
        this.imgData.data[index + 2] = b;
        this.imgData.data[index + 3] = 255;
    }


    ImageBit.prototype.fillCircleLine = function (i, j, delta, r,g,b) {
        if (j < 0 || j >= this.height) return;  //if y is top or bottom then stop
        if (i + delta < 0 || i-delta >this.width) return; //if the circle is left or right of the canvas

        var imin = Math.max(0, i - delta);
        var imax = Math.min(i + delta, this.width);

        //fill the entire line at coordinate i
        for (var increment = imin; increment<= imax; increment++)
        {
            var index = (j * this.width + increment) * 4;
            this.imgData.data[index] = r;
            this.imgData.data[index+1] = g;
            this.imgData.data[index+2] = b;
            this.imgData.data[index+3] = 255;
        }
    }


    ImageBit.prototype.fillColor = function (r,g,b,a) {
        for (var i = 0; i < (4 * this.width * this.height) ; i = i + 4) {
            this.imgData.data[i] = r;
            this.imgData.data[i + 1] = g;
            this.imgData.data[i + 2] = b;
            this.imgData.data[i + 3] = a;
        }
    };

