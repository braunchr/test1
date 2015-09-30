importScripts("Bignum.js");

//******************************************************************
//                        MSET - CONSTRUCTOR
//*******************************************************************
function MSet(maxiter, threshold, color1, color2, color3) 
{
    this.maxiter = maxiter; // maximum number of iterations
    this.maxRefIter = 0; // stores the maximum number of iterations before the reference point escapes: The bailout index
    this.ApproxIndexStart = 0; // Stores the index below which the ABC series approximation is valid. Above this the delta calc must be used
    this.threshold = threshold;// used to color points close to the set
    this.xyInc = 0; // float representation of a pixel size
    var MaxArray = 10000;
    this.Xxorbit = new Array(MaxArray);// Stores the orbit of the Refence point X
    this.Xyorbit = new Array(MaxArray);// Declarations of arrays are made here for performance. 
    this.Xpxorbit = new Array(MaxArray);// Stores the orbit of the Refence point X
    this.Xpyorbit = new Array(MaxArray);// Declarations of arrays are made here for performance. 

    this.Axorbit = new Array(MaxArray);	// A, B, and C are the coefficients of a taylor expansion 
    this.Ayorbit = new Array(MaxArray);	// around the reference point 
    this.Bxorbit = new Array(MaxArray);	// A is the first order coefficient of Delta (D)
    this.Byorbit = new Array(MaxArray); // B is the coefficeint of D^2 and C of D^3
    this.Cxorbit = new Array(MaxArray);	// provided the term in C is smaller than the term in B,
    this.Cyorbit = new Array(MaxArray); // the approximation is reliable. 
    this.Yxorbit = new Array(MaxArray);	// Y can be computed from a reference point X using floating arithmetics
    this.Yyorbit = new Array(MaxArray);	// Y can be computed from a reference point X using floating arithmetics

    this.Apxorbit = new Array(MaxArray);	// A, B, and C are the coefficients of a taylor expansion 
    this.Apyorbit = new Array(MaxArray);	// around the reference point 
    this.Bpxorbit = new Array(MaxArray);	// A is the first order coefficient of Delta (D)
    this.Bpyorbit = new Array(MaxArray); // B is the coefficeint of D^2 and C of D^3
    this.Cpxorbit = new Array(MaxArray);	// provided the term in C is smaller than the term in B,
    this.Cpyorbit = new Array(MaxArray); // the approximation is reliable. 
    this.Ypxorbit = new Array(MaxArray);	// Y can be computed from a reference point X using floating arithmetics
    this.Ypyorbit = new Array(MaxArray);	// Y can be computed from a reference point X using floating arithmetics


    this.YRxorbit = new Array(MaxArray);	// provided the term in C is smaller than the term in B,
    this.YRyorbit = new Array(MaxArray); // the approximation is reliable. 
    this.YAxorbit = new Array(MaxArray);	// provided the term in C is smaller than the term in B,
    this.YAyorbit = new Array(MaxArray); // the approximation is reliable. 

    
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
        imgbit.setPixel(i, j, this.col1[0], this.col1[1], this.col1[2]); // the point is outside the set
        //imgbit.fillDisk(i, j, radius, this.col1[0], this.col1[1], this.col1[2]); //draw a circle and fill it. 
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
    this.xyInc = xyInc;
    var dist = 0;
    var step = 8;

    for (var j = 0; j < imgbit.height; j++) {
        for (var i = 0; i < imgbit.width; i = i + step) {
            if (imgbit.imgData.data[4 * (j * imgbit.width + i) + 3] == 0) //only paint if the pixel is transparent.
            {

                dist = 0.25 * this.refdistance(cx, cy);
                this.colorise(dist, i, j, xyInc, imgbit);
                //dist2 = 0.25 * this.refdistance(cx.plus(imgbit.xyIncrement), cy);

                dist = 0.25 * this.deltadistance(xyInc, 0, cx.plus(imgbit.xyIncrement), cy);
                this.colorise(dist, i + 1, j, xyInc, imgbit);

                //dist2 = 0.25 * this.refdistance(cx.plus(imgbit.xyIncrement), cy);
                               
                dist = 0.25 * this.deltadistance(2 * xyInc, 0, cx.plus(imgbit.xyIncrement.times(2)), cy);
                this.colorise(dist, i + 2, j, xyInc, imgbit);

                dist = 0.25 * this.deltadistance(3 * xyInc, 0, cx.plus(imgbit.xyIncrement.times(3)), cy);
                this.colorise(dist, i + 3, j, xyInc, imgbit);

                dist = 0.25 * this.deltadistance(4 * xyInc, 0, cx.plus(imgbit.xyIncrement.times(4)), cy);
                this.colorise(dist, i + 4, j, xyInc, imgbit);

                
                dist = 0.25 * this.deltadistance(5 * xyInc, 0, cx.plus(imgbit.xyIncrement.times(5)), cy);
                this.colorise(dist, i + 5, j, xyInc, imgbit);

                dist = 0.25 * this.deltadistance(6 * xyInc, 0, cx.plus(imgbit.xyIncrement.times(6)), cy);
                this.colorise(dist, i + 6, j, xyInc, imgbit);

                dist = 0.25 * this.deltadistance(7 * xyInc, 0, cx.plus(imgbit.xyIncrement.times(7)), cy);
                this.colorise(dist, i + 7, j, xyInc, imgbit);

                //dist2 = 0.25 * this.refdistance(cx.plus((imgbit.xyIncrement).times(7)), cy);
                

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
MSet.prototype.refdistance = function (cx, cy) {
    var x = new Big(0), y = new Big(0), x2 = new Big(0), y2 = new Big(0), temp = new Big(0), iter = 0, dist = 0;

    this.Xxorbit[0] = this.Xyorbit[0] = 0;
    this.Axorbit[0] = 0; this.Ayorbit[0] = 0;
    this.Bxorbit[0] = this.Byorbit[0] = 0;
    this.Cxorbit[0] = this.Cyorbit[0] = 0;
    this.Apxorbit[0] = 0; this.Apyorbit[0] = 0;
    this.Bpxorbit[0] = this.Bpyorbit[0] = 0;
    this.Cpxorbit[0] = this.Cpyorbit[0] = 0;

    var computeTaylorSeries = true; //Records if we should continue to compute the ABC series. Typically when the third term is low.
    
    var xdc = ydc = i = fxi = fyi = fx2 = fy2 = 0;
    var flag = false;
    var t = 0;
    var modulus = 0;

    while ((iter < this.maxiter) && (modulus < 10000)) {
        temp = (x2.minus(y2).plus(cx));
        y = (x.times(2).times(y).plus(cy));
        x = temp;
        x2 = x.times(x);
        y2 = y.times(y);


        t = 2 * (this.Xxorbit[iter] * xdc - this.Xyorbit[iter] * ydc) + 1;
        ydc = 2 * (this.Xyorbit[iter] * xdc + this.Xxorbit[iter] * ydc);
        xdc = t;
        flag = (Math.max(Math.abs(xdc), Math.abs(ydc)) > 1e300);


        var Ax = this.Axorbit[iter];
        var Ay = this.Ayorbit[iter];
        var Bx = this.Bxorbit[iter];
        var By = this.Byorbit[iter];
        var Cx = this.Cxorbit[iter];
        var Cy = this.Cyorbit[iter];
        var Xx = this.Xxorbit[iter];
        var Xy = this.Xyorbit[iter];

        var Apx = this.Apxorbit[iter];
        var Apy = this.Apyorbit[iter];
        var Bpx = this.Bpxorbit[iter];
        var Bpy = this.Bpyorbit[iter];
        var Cpx = this.Cpxorbit[iter];
        var Cpy = this.Cpyorbit[iter];
        var Xpx = this.Xpxorbit[iter];
        var Xpy = this.Xpyorbit[iter];



        // Store the next iteration of the orbit and coefficients of the perturbation
        iter++; // We now go to N+1
        this.Xxorbit[iter] = x.toFloat();
        this.Xyorbit[iter] = y.toFloat();

        this.Xpxorbit[iter] = xdc;
        this.Xpyorbit[iter] = ydc;

        if (computeTaylorSeries == true) { // calculate the coefficients of the ABC series recursively until they are no longer precise enough

            this.Axorbit[iter] = 2 * (Ax * Xx - Ay * Xy) + 1;
            this.Ayorbit[iter] = 2 * (Ax * Xy + Ay * Xx);

            this.Bxorbit[iter] = 2 * (Bx * Xx - By * Xy) + Ax * Ax - Ay * Ay;
            this.Byorbit[iter] = 2 * (Bx * Xy + By * Xx) + 2 * Ax * Ay;

            this.Cxorbit[iter] = 2 * (Cx * Xx - Cy * Xy) + 2 * (Ax * Bx - Ay * By);
            this.Cyorbit[iter] = 2 * (Cx * Xy + Cy * Xx + Ax * By + Bx * Ay);

            // A'n+1 = 2(Z'n*An + Zn*A'n)
            // B'n+1 = 2(Z'n*Bn + Zn*B'n + An*A'n)
            // C'n+1 = 2(Z'n*Cn + Zn*C'n + An*B'n + Bn*A'n)

            this.Apxorbit[iter] = 2 * (Xpx * Ax - Xpy * Ay + Xx * Apx - Xy * Apy);
            this.Apyorbit[iter] = 2 * (Xpx * Ay + Xpy * Ax + Xy * Apx + Xx * Apy);

            this.Bpxorbit[iter] = 2 * (Xpx * Bx - Xpy * By + Xx * Bpx - Xy * Bpy + Ax * Apx - Ay * Apy);
            this.Bpyorbit[iter] = 2 * (Xpx * By + Xpy * Bx + Xy * Bpx + Xx * Bpy + Ay * Apx + Ax * Apy);

            this.Cpxorbit[iter] = 2 * (Xpx * Cx - Xpy * Cy + Xx * Cpx - Xy * Cpy + Ax * Bpx - Ay * Bpy + Bx * Apx - By * Apy);
            this.Cpyorbit[iter] = 2 * (Xpx * Cy + Xpy * Cx + Xy * Cpx + Xx * Cpy + Ay * Bpx + Ax * Bpy + By * Apx + Bx * Apy);
        }

        if ((Math.abs(this.xyInc * this.Cxorbit[iter] * 10000) > Math.abs(this.Bxorbit[iter]))) {  // check if C is too large (0.1% of B term)
            this.ApproxIndexStart = iter;
            computeTaylorSeries = false;
        }

        modulus = x2.toFloat() + y2.toFloat();

    }

    this.maxRefIter = iter; // this stores the bailout index of the refernce point. 

    if (iter < this.maxiter && flag == false) { //we have escaped before reaching the max iteration, estimate the distance
        dist = Math.log(modulus) * Math.sqrt(modulus) / Math.sqrt(xdc * xdc + ydc * ydc);
    }

    return dist;


    /*  
  if (iter < this.maxiter) { //we have escaped before reaching the max iteration, estimate the distance
      xdc = ydc = i = fxi = fyi = fx2 = fy2 =0;
      flag = false;
      t = 0;
      modulus = 0;

      while ((i < iter) && (flag == false) && (modulus < 10000)) {
          
          t = 2 * (this.Xxorbit[i] * xdc - this.Xyorbit[i] * ydc) + 1;
          ydc = 2 * (this.Xyorbit[i] * xdc + this.Xxorbit[i] * ydc);
          xdc = t;

          
          flag = (Math.max(Math.abs(xdc), Math.abs(ydc)) > 1e300);
          
          i++;

          var tst = xdc - this.Xpxorbit[i];


          modulus = this.Xxorbit[i] * this.Xxorbit[i] + this.Xyorbit[i] * this.Xyorbit[i];
      }

      if (flag == false) {
          dist = Math.log(modulus) * Math.sqrt(modulus) / Math.sqrt(xdc * xdc + ydc * ydc);
      }
      

    return dist;
    */

}


//***************************************************************************************
//                 DISTANCE ESTIMATOR FOR POINT Y = X + DELTA USING PERTURBATION THEORY
//
// Dn+1 = 2*Zn*Dn + Dn*Dn + D0
// DZ'n+1 = 2(Z'n*Dn + ZnDZ'n + DZn*DZ'n)
//
// A'n+1 = 2(Z'n*An + Zn*A'n)
// B'n+1 = 2(Z'n*Bn + Zn*B'n + An*A'n)
// C'n+1 = 2(Z'n*Cn + Zn*C'n + An*B'n + Bn*A'n)
//***************************************************************************************
MSet.prototype.deltadistance = function (deltax, deltay, cx, cy) {
    
    var dist = 0;

    var x, y, t, dx0, dy0, dx, dy, d2c, d2y, d3x, d3y;  // the powers square and cube of delta
    var term1x, term1y, term2x, term2y, term3x, term3y; // the three terms of Delta N = AnDn + BnDn^2 + CnDn^3
    var iter;
    
    var xr = new Big(0);
    var yr = new Big(0);
    var x2 = new Big(0);
    var y2 = new Big(0);
    var temp = new Big(0);
    var dist = 0;

    this.Xxorbit[0] = this.Xyorbit[0] = 0;
    this.Yxorbit[0] = this.Yyorbit[0] = 0;
    this.YAxorbit[0] = this.YAyorbit[0] = 0;
    this.YRxorbit[0] = this.YRyorbit[0] = 0;


    iter = 0;
    x = 0;
    y = 0;
    dx = 0;
    dy = 0;
    

    // Using the approximation
    // Store the value of Delta0
    dx0 = deltax;
    dy0 = deltay;

    // Compute the square of Delta0
    d2x0 = dx0 * dx0 - dy0 * dy0;
    d2y0 = 2 * deltax * deltay;

    // Compute the cube of Delta0
    d3x0 = dx0 * d2x0 - dy0 * d2y0;
    d3y0 = dy0 * d2x0 + dx0 * d2y0;

    var xapp, yapp;
    var done = false;

    
    while ((iter < this.maxRefIter) && ( (x*x + y*y) < 10000)) {

  
        // these calculations are for iter =  N, not N+1 yet. 
        //use the exact formula Dn+1 = 2*Zn*Dn + Dn*Dn + D0
         t = 2 * (this.Xxorbit[iter] * dx - this.Xyorbit[iter] * dy) + (dx*dx-dy*dy) + dx0;
         dy = 2 * (this.Xyorbit[iter] * dx + this.Xxorbit[iter] * dy) + 2 * dx * dy + dy0;
         dx = t;
         
        //===Calculation of the ref point. again, using N, not N+1
    /*
         temp = (x2.minus(y2).plus(cx));
         yr = (xr.times(2).times(yr).plus(cy));
         xr = temp;
         x2 = xr.times(xr);
         y2 = yr.times(yr);
         */

         iter++;  // we now go to N+1

        // first with the Delta exact forumula
         x = this.Xxorbit[iter] + dx;
         y = this.Xyorbit[iter] + dy;
         this.Yxorbit[iter] = x;
         this.Yyorbit[iter] = y;
    
        /*
        // then with the exact high precision Mandelbrot forumla
        this.YRxorbit[iter] = xr.toFloat();
        this.YRyorbit[iter] = yr.toFloat();

        // finally with the series approximation formula
        */

        
        if (iter == this.ApproxIndexStart && done == false) {

            term1x = dx0 * this.Axorbit[iter] - dy0 * this.Ayorbit[iter];
            term1y = dx0 * this.Ayorbit[iter] + dy0 * this.Axorbit[iter];
            term2x = d2x0 * this.Bxorbit[iter] - d2y0 * this.Byorbit[iter];
            term2y = d2x0 * this.Byorbit[iter] + d2y0 * this.Bxorbit[iter];
            term3x = d3x0 * this.Cxorbit[iter] - d3y0 * this.Cyorbit[iter];
            term3y = d3x0 * this.Cyorbit[iter] + d3y0 * this.Cxorbit[iter];
            xapp = term1x + term2x + term3x;
            yapp = term1y + term2y + term3y;
            this.YAxorbit[iter] = this.Xxorbit[iter] + xapp;
            this.YAyorbit[iter] = this.Xyorbit[iter] + yapp;
            dx = xapp;
            dy = yapp;
            done = true;
        }

    }

    
    if (x * x + y * y > 10000) {
        /*
        //////// with the Refernce point
        var xdc = ydc = 0;
        var flag = false;
        var t = 0;

        var i = 0;
        flag = false;
        while ((i < iter ) && (flag == false)) {
            t = 2 * (this.YRxorbit[i] * xdc - this.YRyorbit[i] * ydc) + 1;
            ydc = 2 * (this.YRyorbit[i] * xdc + this.YRxorbit[i] * ydc);
            xdc = t;
            flag = (Math.max(Math.abs(xdc), Math.abs(ydc)) > 1e300);
            i++;
        }
        if (flag == false)
            var modulus = this.YRxorbit[i] * this.YRxorbit[i] + this.YRyorbit[i] * this.YRyorbit[i];
        dist = Math.log(modulus) * Math.sqrt(modulus) / Math.sqrt(xdc * xdc + ydc * ydc);
        */
        // With the Delta perturbatino exact method

        xdc = ydc = 0;
        flag = false;
        t = 0;

        i = 0;
        flag = false;
        while ((i < iter ) && (flag == false)) {
            t = 2 * (this.Yxorbit[i] * xdc - this.Yyorbit[i] * ydc) + 1;
            ydc = 2 * (this.Yyorbit[i] * xdc + this.Yxorbit[i] * ydc);
            xdc = t;
            flag = (Math.max(Math.abs(xdc), Math.abs(ydc)) > 1e300);
            i++;
        }
        if (flag == false)
            var modulus = this.Yxorbit[i] * this.Yxorbit[i] + this.Yyorbit[i] * this.Yyorbit[i];
        var distD = Math.log(modulus) * Math.sqrt(modulus) / Math.sqrt(xdc * xdc + ydc * ydc);


        // with the Series Approxumation 

        xdc = ydc = 0;
        flag = false;
        t = 0;

        i = 0;
        flag = false;
        while ((i < iter ) && (flag == false)) {
            t = 2 * (this.YAxorbit[i] * xdc - this.YAyorbit[i] * ydc) + 1;
            ydc = 2 * (this.YAyorbit[i] * xdc + this.YAxorbit[i] * ydc);
            xdc = t;
            flag = (Math.max(Math.abs(xdc), Math.abs(ydc)) > 1e300);
            i++;
        }
        if (flag == false)
            var modulus = this.YAxorbit[i] * this.YAxorbit[i] + this.YAyorbit[i] * this.YAyorbit[i];
        distA = Math.log(modulus) * Math.sqrt(modulus) / Math.sqrt(xdc * xdc + ydc * ydc);

    }
    return distD;


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




