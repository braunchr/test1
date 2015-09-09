importScripts("Bignum.js");



//******************************************************************
//                        MSET - CONSTRUCTOR
//*******************************************************************
function MSet(maxiter, threshold, color1, color2, color3) 
{
    this.maxiter = maxiter; // maximum number of iterations
    this.threshold = threshold;// used to color points close to the set
    this.xorbit = new Array(10000);// Stores the orbit of x. Declare here for performance	
    this.yorbit = new Array(10000);// Stores the orbit of y. Declare here for performance 	

    hexToRGB = function (hex) {
        var h = parseInt(hex.substr(1, 7),16); //Remove #. Parse HEX color to a 16 bit integer.
        var r = (h >> 16) & 0xFF;
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

    var cx = imgbit.x1;
    var cy = imgbit.y1;
    var dist = 0;

    for (var j = 0; j < imgbit.height; j++) {
        for (var i = 0; i < imgbit.width; i++) {
            if (imgbit.imgData.data[4 * (j * imgbit.width + i) + 3] == 0) //only paint if the pixel is transparent.
            {

                dist = this.distance(cx, cy);
      


                if (dist > this.maxiter / this.threshold)  {
                    imgbit.setPixel(i, j, this.col3[0], this.col3[1], this.col3[2]); // the point is outside the set
                }
                else if (dist < this.maxiter / this.threshold && dist > 1) {
                    imgbit.setPixel(i, j, this.col2[0], this.col2[1], this.col2[2]); // the point is just outside the set

                }
                else {
                    imgbit.setPixel(i, j, 0, 0, 0); // the point is IN the set
                }





                //if (dist == 0)
                //    imgbit.setPixel(i, j, 0, 0, 0); // the point is IN the set
                //else
                //    imgbit.setPixel(i, j, 50, 50, 200); // the point is out of the set
            }

            cx = cx.plus(imgbit.xyIncrement); //increment the x axis by one pixel
        }
        cx = imgbit.x1; // reset the x axis for the next line
        cy = cy.minus(imgbit.xyIncrement);  // increment the y axis by one pixel
    }
    return imgbit;

    /*
  
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
    */



}


//***************************************************************
//                           DISTANCE ESTIMATOR 
// Iterates through f(z) = z^2 + C of coordinates cx and cy start at z0=0
// If after a maximum nr of iterations, the function still converges, then C is in the set 
//***************************************************************
MSet.prototype.distance = function(cx, cy)
{
    var x = new Big(0), y = new Big(0), x2 = new Big(0), y2 = new Big(0), temp = new Big(0), iter = 0;

    this.xorbit[0] = this.yorbit[0] = new Big(0);
  
    while ((iter < this.maxiter) && ((x2.plus(y2)).compare(4)<0))
    {
        temp = (x2.minus(y2).plus(cx));
        y = (x.times(2).times(y).plus(cy));
        x = temp;
        x2 = x.times(x);
        y2 = y.times(y);
        iter++;
        //if (iter == 22) debugger;
        this.xorbit[iter] = x;
        this.yorbit[iter] = y;
    }
 
    if (iter < this.maxiter) { //we have escaped before reaching the max iteration, estimate the distance
        var xdc = ydc = i = xi = yi = fxi = fyi = fx2 = fy2 =0;
        var flag = false;
        var t = 0;

        while ((i < iter) && (flag == false)) {
            
            xi = this.xorbit[i].toFloat();
            yi = this.yorbit[i].toFloat();

            t = 2 * (xi * xdc - yi * ydc) + 1;
            ydc = 2 * (yi * xdc + xi * ydc);
            xdc = t;
            flag = (Math.max(Math.abs(xdc), Math.abs(ydc)) > 1e300);
            i++;
        }
        if (flag == false) {
            var modulus = x2.toFloat() + y2.toFloat();
            dist = Math.log(modulus) * Math.sqrt(modulus) / Math.sqrt(xdc * xdc + ydc * ydc);
        }
    }

    return dist;

    //return (iter == this.maxiter) ? 0: iter; 

}
