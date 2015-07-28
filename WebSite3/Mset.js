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

                if (dist == 0)
                    imgbit.setPixel(i, j, 0, 0, 0); // the point is IN the set
                else
                    imgbit.setPixel(i, j, 50, 50, 200); // the point is out of the set
            }

            cx = (cx.plus(imgbit.xyIncrement)).round(precision); //increment the x axis by one pixel
        }
        cx = imgbit.x1; // reset the x axis for the next line
        cy = (cy.minus(imgbit.xyIncrement)).round(precision);  // increment the y axis by one pixel
    }
    return imgbit;
}


//***************************************************************
//                           DISTANCE ESTIMATOR 
// Iterates through f(z) = z^2 + C of coordinates cx and cy start at z0=0
// If after a maximum nr of iterations, the function still converges, then C is in the set 
//***************************************************************
MSet.prototype.distance = function(cx, cy)
{
    var x = new Big(0), y = new Big(0), x2 = new Big(0), y2 = new Big(0), temp = new Big(0), flag = false, iter = 0;

    this.xorbit[0] = this.yorbit[0] = new Big(0);
  
    while ((iter < this.maxiter) && ((x2.plus(y2)).lt(4)))
    {
        temp = (x2.minus(y2).plus(cx)).round(precision);
        y = (x.times(2).times(y).plus(cy)).round(precision);
        x = temp;
        x2 = x.times(x).round(precision);
        y2 = y.times(y).round(precision);
        iter++;
        //if (iter == 22) debugger;
        this.xorbit[iter] = x;
        this.yorbit[iter] = y;
    }
 
    return (iter == this.maxiter) ? 0: iter; 

}
