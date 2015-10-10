
// constructor
function ImageBit (imgData, x1, y1, x2) {

    this.imgData = imgData;
    this.width = imgData.width;
    this.height = imgData.height;
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.xSide = (this.x2).minus(this.x1);
    this.xyIncrement = (this.xSide).divint(this.width);

}

   
    //*************************************************************
    //this function draws a circle with xc, jc and rad in pixels
    //*************************************************************
ImageBit.prototype.drawCircle = function (ic, jc, rad, r, g, b) {
    var i = rad;
    var j = 0;
    var iChange = 1 - 2 * rad;
    var jChange = 1;
    var radiusError = 0;
    while (i >= j) {
        this.setPixel(ic + i, jc + j, r, g, b);
        this.setPixel(ic + i, jc - j, r, g, b);
        this.setPixel(ic - i, jc + j, r, g, b);
        this.setPixel(ic - i, jc - j, r, g, b);
        this.setPixel(ic + j, jc + i, r, g, b);
        this.setPixel(ic + j, jc - i, r, g, b);
        this.setPixel(ic - j, jc + i, r, g, b);
        this.setPixel(ic - j, jc - i, r, g, b);
        j++;
        radiusError = radiusError + jChange;
        jChange = jChange + 2;
        if (2 * radiusError + iChange > 0) {
            i--;
            radiusError = radiusError + iChange;
            iChange = iChange + 2;
        }
    }
}

   
    //*************************************************************
    //this function fills a black circle centred ic, jc and rad in pixels
    //*************************************************************
ImageBit.prototype.fillDisk = function (ic, jc, rad, r, g, b) {
    var i = rad;
    var j = 0;
    var ichange = 1 - 2 * rad;
    var jchange = 1;
    var radiusError = 0;
    while (i >= j) {
       this.fillCircleLine(ic, jc + j, i, r, g, b);
       this.fillCircleLine(ic, jc - j, i, r, g, b);
       this.fillCircleLine(ic, jc + i, j, r, g, b);
       this.fillCircleLine(ic, jc - i, j, r, g, b);

        j++;
        radiusError = radiusError + jchange;
        jchange = jchange + 2;
        if (2 * radiusError + ichange > 0) {
            i--;
            radiusError = radiusError + ichange;
            ichange = ichange + 2;
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


ImageBit.prototype.fillCircleLine = function (i, j, delta, r, g, b) {
    if (j < 0 || j >= this.height) return;  //if y is top or bottom then stop
    if (i + delta < 0 || i - delta >= this.width) return; //if the circle is left or right of the canvas

    var imin = Math.max(0, i - delta);
    var imax = Math.min(i + delta, this.width);

    //fill the entire line at coordinate i
    for (var increment = imin; increment < imax; increment++) {
        var index = (j * this.width + increment) * 4;
        if (this.imgData.data[index + 3] == 0) { // no need to repaint multiple times
            this.imgData.data[index] = r;
            this.imgData.data[index + 1] = g;
            this.imgData.data[index + 2] = b;
            this.imgData.data[index + 3] = 255;
        }
    }

}


    