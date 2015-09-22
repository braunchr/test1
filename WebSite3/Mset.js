importScripts("Bignum.js");

//******************************************************************
//                        MSET - CONSTRUCTOR
//*******************************************************************
function MSet(maxiter, threshold, color1, color2, color3) 
{
    this.maxiter = maxiter; // maximum number of iterations
    this.maxRefIter = 0; // stores the maximum number of iterations before the reference point escapes 
    this.threshold = threshold;// used to color points close to the set
    var MaxArray = 10000;
    this.Xxorbit = new Array(MaxArray);// Stores the orbit of the Refence point X
    this.Xyorbit = new Array(MaxArray);// Declarations of arrays are made here for performance. 

    this.Axorbit = new Array(MaxArray);	// A, B, and C are the coefficients of a taylor expansion 
    this.Ayorbit = new Array(MaxArray);	// around the reference point 
    this.Bxorbit = new Array(MaxArray);	// A is the first order coefficient of Delta (D)
    this.Byorbit = new Array(MaxArray); // B is the coefficeint of D^2 and C of D^3
    this.Cxorbit = new Array(MaxArray);	// provided the term in C is smaller than the term in B,
    this.Cyorbit = new Array(MaxArray); // the approximation is reliable. 

    this.Yxorbit = new Array(MaxArray);	// Stores the orbit of point Y = X+ Delta in perturbation theory
    this.Yyorbit = new Array(MaxArray);	// Y can be computed from a reference point X using floating arithmetics

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

MSet.prototype.colorise = function (dist, i, j, xyInc, imgbit) {

    var radius = Math.floor(dist / xyInc);

    if (radius > 1) {
        //imgbit.setPixel(i, j, this.col1[0], this.col1[1], this.col1[2]); // the point is outside the set
        imgbit.fillDisk(i, j, radius, this.col1[0], this.col1[1], this.col1[2]); //draw a circle and fill it. 
    }
    else if (dist > xyInc / this.threshold && dist >= 4 * xyInc / this.threshold) {
        imgbit.setPixel(i, j, this.col2[0], this.col2[1], this.col2[2]); // the point is just outside the set
    }
    else if (dist > xyInc / this.threshold && dist < 4 * xyInc / this.threshold) {
        imgbit.setPixel(i, j, this.col3[0], this.col3[1], this.col3[2]); // the point is just outside the set

    }
    else {
        imgbit.setPixel(i, j, 0, 0, 0); // the point is IN the set
    }
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
    var xyInc = imgbit.xyIncrement.toFloat();
    var dist = 0;
    var step = 8;

    for (var j = 0; j < imgbit.height; j++) {
        for (var i = 0; i < imgbit.width; i=i+step) {
            if (imgbit.imgData.data[4 * (j * imgbit.width + i) + 3] == 0) //only paint if the pixel is transparent.
            {

                dist = 0.25 * this.refdistance(cx, cy);
                this.colorise(dist, i, j, xyInc, imgbit);

                dist = 0.25 * this.deltadistance(xyInc, 0);
                this.colorise(dist, i + 1, j, xyInc, imgbit);

                dist = 0.25 * this.deltadistance(xyInc, 0);
                this.colorise(dist, i + 2, j, xyInc, imgbit);

                dist = 0.25 * this.deltadistance(xyInc, 0);
                this.colorise(dist, i + 3, j, xyInc, imgbit);

                dist = 0.25 * this.deltadistance(xyInc, 0);
                this.colorise(dist, i + 4, j, xyInc, imgbit);

                dist = 0.25 * this.deltadistance(xyInc, 0);
                this.colorise(dist, i + 5, j, xyInc, imgbit);

                dist = 0.25 * this.deltadistance(xyInc, 0);
                this.colorise(dist, i + 6, j, xyInc, imgbit);

                dist = 0.25 * this.deltadistance(xyInc, 0);
                this.colorise(dist, i + 7, j, xyInc, imgbit);

                
            }

            cx = cx.plus(imgbit.xyIncrement.times(step)); //increment the x axis by one pixel
        }
        cx = imgbit.x1; // reset the x axis for the next line
        cy = cy.minus(imgbit.xyIncrement);  // increment the y axis by one pixel
    }
    return imgbit;
}
  

//***************************************************************
//         HIGH PRECISION DISTANCE ESTIMATOR FOR REFERENCE POINT
// Iterates through f(z) = z^2 + C of coordinates cx and cy start at z0=0
// If after a maximum nr of iterations, the function still converges, then C is in the set 
//***************************************************************
MSet.prototype.refdistance = function(cx, cy)
{
    var x = new Big(0), y = new Big(0), x2 = new Big(0), y2 = new Big(0), temp = new Big(0), iter = 0, dist = 0;

    this.Xxorbit[0] = this.Xyorbit[0] = 0;
    this.Axorbit[0] = 1; this.Ayorbit[0] = 0;
    this.Bxorbit[0] = this.Byorbit[0] = 0;
    this.Cxorbit[0] = this.Cyorbit[0] = 0;

    while ((iter < this.maxiter) && ((x2.plus(y2)).compare(10000)<0))
    {
        temp = (x2.minus(y2).plus(cx));
        y = (x.times(2).times(y).plus(cy));
        x = temp;
        x2 = x.times(x);
        y2 = y.times(y);

        var Anx = this.Axorbit[iter];
        var Any = this.Ayorbit[iter];
        var Bnx = this.Axorbit[iter];
        var Bny = this.Ayorbit[iter];
        var Cnx = this.Axorbit[iter];
        var Cny = this.Ayorbit[iter];
        var Xnx = this.Xxorbit[iter];
        var Xny = this.Xyorbit[iter];

        // Store the next iteration of the orbit and coefficients of the perturbation
        iter++;
        this.Xxorbit[iter] = x.toFloat();
        this.Xyorbit[iter] = y.toFloat();

        this.Axorbit[iter] = 2 * (Anx * Xnx - Any * Xny) + 1;
        this.Ayorbit[iter] = 2 * (Anx * Xny + Any * Xnx);

        this.Bxorbit[iter] = 2 * (Bnx * Xnx - Bny * Xny) + Anx * Anx - Any * Any;
        this.Byorbit[iter] = 2 * (Bnx * Xny + Bny * Xnx) + 2 * Anx * Any;

        this.Cxorbit[iter] = 2 * (Cnx * Xnx - Cny * Xny) + 2*(Anx * Bnx - Any * Bny);
        this.Cyorbit[iter] = 2 * (Cnx * Xny + Cny * Xnx + Anx * Bny + Bnx * Any);

    }
 
    if (iter < this.maxiter) { //we have escaped before reaching the max iteration, estimate the distance
        var xdc = ydc = i = fxi = fyi = fx2 = fy2 =0;
        var flag = false;
        var t = 0;

        while ((i < iter) && (flag == false)) {
            
            t = 2 * (this.Xxorbit[i] * xdc - this.Xyorbit[i] * ydc) + 1;
            ydc = 2 * (this.Xyorbit[i] * xdc + this.Xxorbit[i] * ydc);
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


//***************************************************************************************
//                 DISTANCE ESTIMATOR FOR POINT Y = X + DELTA USING PERTURBATION THEORY
// 
//***************************************************************************************
MSet.prototype.deltadistance = function (deltax, deltay) {
    
    var dist = 0;

    this.Yxorbit[0] = this.Yyorbit[0] = 0;
    
    var dx = dy = d2c = d2y = d3x = d3y = 0;  // the powers square and cube of delta
    var term1x = term1y = term2x = term2y = 0; // the three terms of Delta N = AnDn + BnDn^2 + CnDn^3
    var anx = any = bnx = bny = cnx = cny = 0; // the values of An Bn and Cn
    
    // Store the value of Delta
    dx = deltax;
    dx = deltay; 

    // compute the square of Delta
    d2x = dx*dx - dy*dy;
    d2y = 2*deltax*deltay;

    // compute the cube of Delta
    d3x = dx*d2x - dy*d2y;
    d3y = dy*d2x + dx*d2y;

    var i = 0;
    var modulus = 0;
        
    while ((i < this.maxRefIter) && (modulus <10000)) {
       
        term1x = dx*this.Axorbit[i] - dy*this.Ayorbit[i];
        term1y = dx*this.Ayorbit[i] + dy*this.Axorbit[i];
        term2x = d2x*this.Bxorbit[i] - d2y*this.Byorbit[i];
        term2y = d2x*this.Byorbit[i] + d2y*this.Bxorbit[i];
        term3x = d3x*this.Cxorbit[i] - d3y*this.Cyorbit[i];
        term3y = d3x*this.Cyorbit[i] + d3y*this.Cxorbit[i];

        i++;
        this.Yxorbit[i] = term1x + term2x + term3x;
        this.Yyorbit[i] = term1y + term2y + term3y;

        modulus = this.Yxorbit[i] * this.Yxorbit[i] + this.Yyorbit[i] * this.Yyorbit[i];
    
    }
            
    if (i < this.maxRefIter) {
            dist = Math.log(modulus) * Math.sqrt(modulus) / Math.sqrt(xdc * xdc + ydc * ydc);
        }
    
    return dist;


}



//***************************************************************
//                           FLOATING POINT DISTANCE ESTIMATOR 
// Iterates through f(z) = z^2 + C of coordinates cx and cy start at z0=0
// If after a maximum nr of iterations, the function still converges, then C is in the set 
//***************************************************************
MSet.prototype.fdistance = function (cx, cy) {

    var x = 0, y = 0, x2 = 0, y2 = 0, dist = 0, iter = 0, temp = 0, xdc = 0, ydc = 0, i = 0, flag = false;
    this.Xxorbit[0] = this.Xyorbit[0] = 0;

    while ((iter < this.maxiter) && ((x2 + y2) < 10000)) {
        temp = x2 - y2 + cx;
        y = 2 * x * y + cy;
        x = temp;
        x2 = x * x;
        y2 = y * y;
        iter++;
        this.Xxorbit[iter] = x;
        this.Xyorbit[iter] = y;
    }

    if ((x2 + y2) > 10000) {
        xdc = ydc = 0;
        i = 0;
        flag = false;
        while ((i < iter) && (flag == false)) {
            temp = 2 * (this.Xxorbit[i] * xdc - this.Xyorbit[i] * ydc) + 1;
            ydc = 2 * (this.Xyorbit[i] * xdc + this.Xxorbit[i] * ydc);
            xdc = temp;
            flag = (Math.max(Math.abs(xdc), Math.abs(ydc)) > 1e300);
            i++;
        }
        if (flag == false)
            dist = Math.log(x2 + y2) * Math.sqrt(x2 + y2) / Math.sqrt(xdc * xdc + ydc * ydc);
    }
    return dist;
}




