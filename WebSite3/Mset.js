

/******************************************************************
                        MSET - CONSTRUCTOR
*******************************************************************/
function MSet(maxiter, threshold, color1, color2, color3) 
{
    this.maxiter = maxiter; // maximum number of iterations
    this.threshold = threshold;// used to color points close to the set
    this.xorbit = new Array(10000);// Stores the orbit of x. Declare here for performance	
    this.yorbit = new Array(10000);// Stores the orbit of y. Declare here for performance 	
    
    hexToRGB = function (hex) {
        var h = parseInt(hex.substr(1, 7),16); //Remove #. Parse HEX color to a 16 bit integer.
        var r = (h >> 16) &0xFF;
        var g = (h >> 8) & 0xFF;
        var b = h & 0xFF;
        return [r, g, b];
    }

    this.col1 = hexToRGB(color1);
    this.col2 = hexToRGB(color2);
    this.col3 = hexToRGB(color3);

}

//***************************************************************
//                           PAINT
// Entry function called to fill an image with the set data. 
// fills an image Bitmap of given height and width by iterating through the pixels. 
// if a pixel is already painted, then dont compute it. 
//***************************************************************
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

//****************************************************************
//                           PAINTDISK
// Calculates whether the point at pixel coordinate i,j is in the set
// Do this by estimating the lower bound of the distance to the set
// If this lower distance is more than a pixel, then draw a disc
// Otherwise, paint a discrete pixel of different color depending on distance
//****************************************************************

 MSet.prototype.paintDisk = function( i,  j, imgbit)  
{
    var x = imgbit.x1 + i / imgbit.pixOverX;
    var y = imgbit.y1 - j / imgbit.pixOverX;

    var dist = 0.25 * this.distance(x, y);
    var radius = Math.floor(dist * imgbit.pixOverX);

    if (radius > 1)
    {
        imgbit.fillDisk(i, j, radius, this.col1[0], this.col1[1], this.col1[2]); //draw a circle and fill it. 
        }
    else if (dist > 1 / imgbit.pixOverX / this.threshold && dist >= 4 / imgbit.pixOverX / this.threshold) {
        imgbit.setPixel(i, j, this.col2[0], this.col2[1], this.col2[2]); // the point is just outside the set
    }
    else if (dist > 1 / imgbit.pixOverX / this.threshold && dist < 4 / imgbit.pixOverX / this.threshold)
    {
     imgbit.setPixel(i, j, this.col3[0], this.col3[1], this.col3[2]); // the point is just outside the set
 
    }
    else
        {
        imgbit.setPixel(i, j, 0, 0, 0); // the point is IN the set
    }
}

//***************************************************************
//                           DISTANCE ESTIMATOR 
// Iterates through f(z) = z^2 + C of coordinates cx and cy start at z=0
// If after a maximum nr of iterations, the function still converges, then C is in the set 
//***************************************************************
MSet.prototype.distance = function(cx, cy)
{
    var x = 0, y = 0, x2 = 0, y2 = 0, dist = 0, iter = 0, temp = 0, xdc = 0, ydc = 0, i = 0, flag = false;
    this.xorbit[0] = this.yorbit[0] = 0;
  
    while ((iter < this.maxiter) && ((x2 + y2) < 10000))
    {
        temp = x2 - y2 + cx;
        y = 2 * x * y + cy;
        x = temp;
        x2 = x * x;
        y2 = y * y;
        iter++;
        this.xorbit[iter] = x;
        this.yorbit[iter] = y;
    }

    if ((x2 + y2) > 10000)
    {
        xdc = ydc = 0;
        i = 0;
        flag = false;
        while ((i < iter) && (flag == false))
        {
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
