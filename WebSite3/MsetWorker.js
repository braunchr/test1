//importScripts("Mset.js");
//importScripts("ImageBit.js");

self.onmessage = function (e) {

    //get the data from the event
    var imgbit = new ImageBit(e.data.imgbit.imgData, e.data.imgbit.width, e.data.imgbit.height, e.data.imgbit.x1, e.data.imgbit.y1, e.data.imgbit.x2);
    var threshold = e.data.threshold;
    var maxiter = e.data.maxiter;
    var px1 = e.data.px1;
    var py1 = e.data.py1;

    //call the long computation
    var m = new MSet(maxiter, threshold);
    m.paint(imgbit);

    //formats the data to be returned back to the UI thread
    var workerMessage = {
        imgbit: imgbit,
        px1: Math.round(px1),
        py1: Math.round(py1),
    };

    //post back imagebit to the UI thread
    self.postMessage(workerMessage);
    self.close();

}





/******************************************************************
      MSetDist
      ========

  Distance estimator for points near the Mandelbrot set.

*******************************************************************/
function MSet(maxiter, threshold) {
    this.maxiter = maxiter;
    this.threshold = threshold;
    this.xorbit = new Array(10000);/* Stores the orbit of x 	*/
    this.yorbit = new Array(10000);/* Stores the orbit of y 	*/
}


MSet.prototype.paintDisk = function (i, j, imgbit) {
    var x = imgbit.x1 + i / imgbit.pixOverX;
    var y = imgbit.y1 - j / imgbit.pixOverX;

    var dist = 0.25 * this.distance(x, y);
    var radius = Math.floor(dist * imgbit.pixOverX);

    if (radius > 1) {
        imgbit.fillDisk(i, j, radius, 100, 100, 100); //draw a circle and fill it. 
        imgbit.drawCircle(i, j, radius, 100, 100, 100);
    }
    else if (dist > 1 / imgbit.pixOverX / this.threshold && dist < 4 / imgbit.pixOverX / this.threshold) {
        imgbit.setPixel(i, j, 200, 0, 0); // the point is just outside the set
    }
    else if (dist > 1 / imgbit.pixOverX / this.threshold && dist >= 4 / imgbit.pixOverX / this.threshold) {
        imgbit.setPixel(i, j, 0, 255, 0); // the point is just outside the set
    }
    else {
        imgbit.setPixel(i, j, 0, 0, 0); // the point is IN the set
    }
}


MSet.prototype.distance = function (cx, cy) {
    var x = 0, y = 0, x2 = 0, y2 = 0, dist = 0, iter = 0, temp = 0, xdc = 0, ydc = 0, i = 0, flag = false;
    this.xorbit[0] = this.yorbit[0] = 0;

    while ((iter < this.maxiter) && ((x2 + y2) < 10000)) {
        temp = x2 - y2 + cx;
        y = 2 * x * y + cy;
        x = temp;
        x2 = x * x;
        y2 = y * y;
        iter++;
        this.xorbit[iter] = x;
        this.yorbit[iter] = y;
    }

    if ((x2 + y2) > 10000) {
        xdc = ydc = 0;
        i = 0;
        flag = false;
        while ((i < iter) && (flag == false)) {
            temp = 2 * (this.xorbit[i] * xdc - this.yorbit[i] * ydc) + 1;
            ydc = 2 * (this.yorbit[i] * xdc + this.xorbit[i] * ydc);
            xdc = temp;
            flag = (Math.max(Math.abs(xdc), Math.abs(ydc)) > 1e300);
            i++;
        }
        if (flag == false)
            dist = Math.log(x2 + y2) * Math.sqrt(x2 + y2) / Math.sqrt(xdc * xdc + ydc * ydc);
    }
    return dist;
}


MSet.prototype.paint = function (imgbit) {

    for (var j = 0; j < imgbit.height; j++) {
        for (var i = 0; i < imgbit.width; i++) {
            if (imgbit.imgData.data[4 * (j * imgbit.width + i) + 3] == 0) //only paint if the pixel is transparent.
            {
                this.paintDisk(i, j, imgbit);
            }
        }

    }
    return imgbit;
}

/***************************************************************************************/



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

}

   
    //*************************************************************
    //this function draws a circle with xc, yc and rad in pixels
    //*************************************************************
ImageBit.prototype.drawCircle = function (xc, yc, rad, r, g, b) {
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
ImageBit.prototype.fillDisk = function (xc, yc, rad, r, g, b) {
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


//****************************************************************
// this method fills a solid vertical circle line in the circle 
//****************************************************************

ImageBit.prototype.fillCircleLine = function (i, j, delta, r, g, b) {
    if (j < 0 || j >= this.height) return;  //if y is top or bottom then stop
    if (i + delta < 0 || i - delta > this.width) return; //if the circle is left or right of the canvas

    var imin = Math.max(0, i - delta);
    var imax = Math.min(i + delta, this.width);
  
    //fill the entire line at coordinate i
    for (var increment = imin; increment <= imax; increment++) {
        var index = (j * this.width + increment) * 4;
        this.imgData.data[index] = r ;
        this.imgData.data[index + 1] = g ;
        this.imgData.data[index + 2] = b ;
        this.imgData.data[index + 3] = 255;
    }
}

/*

ImageBit.prototype.fillCircleLine = function (i, j, delta, r, g, b) {
    if (j < 0 || j >= this.height) return;  //if y is top or bottom then stop
    if (i + delta < 0 || i - delta > this.width) return; //if the circle is left or right of the canvas

    var imin = Math.max(0, i - delta);
    var imax = Math.min(i + delta, this.width);

    //fill the entire line at coordinate i
    for (var increment = imin; increment <= imax; increment = increment + 1) {
        var index = (j * this.width + increment) * 4;
        this.imgData.data[index] = r;
        this.imgData.data[index + 1] = g;
        this.imgData.data[index + 2] = b;
        this.imgData.data[index + 3] = 255;
    }
}

*/