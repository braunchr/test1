//importScripts("Bignum.js");

//******************************************************************
//                        MSET - CONSTRUCTOR
//*******************************************************************
function MSet(maxiter, threshold, color1, color2, color3) {
    this.maxiter = maxiter; // maximum number of iterations
    this.maxRefIter = 0; // stores the maximum number of iterations before the reference point escapes: The bailout index
    this.ApproxIndexStart = 0; // Stores the index below which the ABC series approximation is valid. Above this the delta calc must be used
    this.ApproxDerivsIndexStart = 0; // Stores the index below which the A'B'C' derivs series approximation is valid. 
    this.threshold = threshold;// used to color points close to the set
    this.xyInc = 0; // float representation of a pixel size
    this.xRef = null;   //stores the coordinates of the Reference point. Null to start with
    this.yRef = null; //stores the coordinates of the Reference point. Null to start with
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

    this.col1;
    this.col2;
    this.col3;


}


MSet.prototype.setColor = function (color1, color2, color3) {

    hexToRGB = function (hex) {
        var h = parseInt(hex.substr(1, 7), 16); //Remove #. Parse HEX color to a 16 bit integer.
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
        // imgbit.setPixel(i, j, this.col1[0], this.col1[1], this.col1[2]); // the point is outside the set
        imgbit.fillDisk(i, j, radius, this.col1[0], this.col1[1], this.col1[2]); //draw a circle and fill it. 
    }
    else if (dist > xyInc / this.threshold && dist >= 4 * xyInc / this.threshold) {
        imgbit.setPixel(i, j, this.col2[0], this.col2[1], this.col2[2]); // the point is just outside the set
    }
    else if (dist > xyInc / this.threshold && dist < 4 * xyInc / this.threshold) {
        imgbit.setPixel(i, j, this.col3[0], this.col3[1], this.col3[2]); // the point is just outside the set

    }
    else if (dist == 0) {
        imgbit.setPixel(i, j, 0, 0, 0); // the point is IN the set and we bailed out

    }
    else
        imgbit.setPixel(i, j, 0, 0, 1); // the point is IN the set but not exactly - still black

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
   
    // calculate the iterations of the reference point
    //var cx = imgbit.x1;
    //var cy = imgbit.y1;
    //dist = this.refdistance(cx, cy);

    var xRefOffset = cx.minus(this.xRef).toFloat();
    var yRefOffset = cy.minus(this.yRef).toFloat();

    for (var j = 0; j < imgbit.height; j++) {
        for (var i = 0; i < imgbit.width; i++) {
            if (imgbit.imgData.data[4 * (j * imgbit.width + i) + 3] == 0) //only paint if the pixel is transparent.
            {
                dist = 0.25 * this.deltadistance(xRefOffset + i * xyInc, yRefOffset - j * xyInc, cx.plus(imgbit.xyIncrement.times(new Big(i))), cy.minus(imgbit.xyIncrement.times(new Big(j))));
                this.colorise(dist, i , j, xyInc, imgbit);
            }
        }
    }
    return imgbit;
}
  

//***************************************************************
//         HIGH PRECISION DISTANCE ESTIMATOR FOR REFERENCE POINT
// Iterates through f(z) = z^2 + C of coordinates cx and cy start at z0=0
// If after a maximum nr of iterations, the function still converges, then C is in the set 
//***************************************************************
MSet.prototype.setRefDistance = function () {
    var x = new Big(0), y = new Big(0), x2 = new Big(0), y2 = new Big(0), temp = new Big(0), iter = 0, dist = 0;

    this.Xxorbit[0] = this.Xyorbit[0] = 0;
    var cx = new Big(this.xRef);
    var cy = new Big(this.yRef);
    this.Xpxorbit[0] = this.Xpyorbit[0] = 0;
    this.Axorbit[0] = 0; this.Ayorbit[0] = 0;
    this.Bxorbit[0] = this.Byorbit[0] = 0;
    this.Cxorbit[0] = this.Cyorbit[0] = 0;
    this.Apxorbit[0] = 0; this.Apyorbit[0] = 0;
    this.Bpxorbit[0] = this.Bpyorbit[0] = 0;
    this.Cpxorbit[0] = this.Cpyorbit[0] = 0;
    this.ApproxIndexStart = 0;



    /*
    //copy has to be deep bause you cant copy objects. 
    this.xRef.s = cx.s;
    this.xRef.e = cx.e;
    this.xRef.v = cx.v;
    this.yRef.s = cy.s;
    this.yRef.e = cy.e;
    this.yRef.v = cy.v;
    */


    var computeTaylorSeries = true; //Records if we should continue to compute the ABC series. Typically when the third term is low.
    var computeDerivsTaylorSeries = true; //Records if we should continue to compute the ABC derivatives series. 

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

        if (computeTaylorSeries == true) { // calculate the coefficients of the ABC series recursively until they are no longer precise enough
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
        }


        // Store the next iteration of the orbit and coefficients of the perturbation
        iter++; // We now go to N+1
        this.Xxorbit[iter] = x.toFloat();
        this.Xyorbit[iter] = y.toFloat();
        
        this.Xpxorbit[iter] = xdc;
        this.Xpyorbit[iter] = ydc;

        if (computeTaylorSeries == true) { // calculate the coefficients of the ABC series recursively until they are no longer precise enough

            // An+1 = 2*Zn*An + 1
            // Bn+1 = 2*Zn*Bn An*An
            // Cn+1 = 2*(Zn*Cn + *Bn*An)

            this.Axorbit[iter] = 2 * (Ax * Xx - Ay * Xy) + 1;
            this.Ayorbit[iter] = 2 * (Ax * Xy + Ay * Xx);

            this.Bxorbit[iter] = 2 * (Bx * Xx - By * Xy) + Ax * Ax - Ay * Ay;
            this.Byorbit[iter] = 2 * (Bx * Xy + By * Xx + Ax * Ay);

            this.Cxorbit[iter] = 2 * (Cx * Xx - Cy * Xy + Ax * Bx - Ay * By);
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

            this.ApproxIndexStart++ ;

            // check if there is an overload on the computation of the Taylor Series (eg C is > 0.01% of B)
            if ((Math.abs(this.Cxorbit[iter] * this.xyInc * 1000) > Math.abs(this.Bxorbit[iter]))) {   
                computeTaylorSeries = false;
            }

            // Or an overload on the computation of the derivatives series (eg Cc is > 0.01% of Bc)
            if ((Math.abs(this.Cpxorbit[iter] * this.xyInc * 1e9) > Math.abs(this.Bpxorbit[iter]))) {
                computeTaylorSeries = false;
            }

        }

        modulus = x2.toFloat() + y2.toFloat();

    }

    this.maxRefIter = iter; // this stores the bailout index of the refernce point. 

    if (this.ApproxIndexStart == 0) this.ApproxIndexStart = iter;
   
    if (iter < this.maxiter && flag == false) { //we have escaped before reaching the max iteration, estimate the distance
        dist = Math.log(modulus) * Math.sqrt(modulus) / Math.sqrt(xdc * xdc + ydc * ydc);
    }

    return dist;

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

    var x, y, temp, tempx,tempy, dx0, dy0, dx, dy, d2c, d2y, d3x, d3y;  // the powers square and cube of delta
    var term1x, term1y, term2x, term2y, term3x, term3y; // the three terms of Delta N = AnDn + BnDn^2 + CnDn^3
    var iter;
    var dpx, dpy; 

    var dist = 0;
    var modulus = 0;

    this.Yxorbit[0] = this.Yyorbit[0] = 0;
    this.Ypxorbit[0] = this.Ypyorbit[0] = 0;

    x = 0;
    y = 0;
    dx = 0;
    dy = 0;
    dpx = 0;
    dpy = 0;


    // Store the value of Delta0, its square and its cube.  
    // We will need these values in the calculations of the Taylor series (next) 
    dx0 = deltax;
    dy0 = deltay;
    d2x0 = dx0 * dx0 - dy0 * dy0;// Compute the square of Delta0
    d2y0 = 2 * deltax * deltay;
    d3x0 = dx0 * d2x0 - dy0 * d2y0;// Compute the cube of Delta0
    d3y0 = dy0 * d2x0 + dx0 * d2y0;

    //Because of the Taylor Series approximation, we can start the iterations further than Zero
    // we calculate the starting iteration of Delta (dx,dy) and DeltaPrime (dpx,dpy) further 
    // Forumlas are Delta_n = An*d0 + Bn*d0^2 + Cn*d0^3 and the same with the derivatives A'B'C'

    iter = this.ApproxIndexStart;

    //Compute the approximation, but start at the point where the C term is Delta0 times lower than the B term. 
    while ((Math.abs(dx0 * this.Cxorbit[iter] * 10000) > Math.abs(this.Bxorbit[iter]))) {
        iter--;
        this.ApproxIndexStart--;
    }


    if (deltax == 1.490289804288e-17 && deltay == 1.9793689703807997e-17) {
        dd = this.getDepth(cx, cy);
        iter = 0;
        
    }

    // calculate the starting poing for hte Taylor function using ABC    
    term1x = dx0 * this.Axorbit[iter] - dy0 * this.Ayorbit[iter];
    term1y = dx0 * this.Ayorbit[iter] + dy0 * this.Axorbit[iter];
    term2x = d2x0 * this.Bxorbit[iter] - d2y0 * this.Byorbit[iter];
    term2y = d2x0 * this.Byorbit[iter] + d2y0 * this.Bxorbit[iter];
    term3x = d3x0 * this.Cxorbit[iter] - d3y0 * this.Cyorbit[iter];
    term3y = d3x0 * this.Cyorbit[iter] + d3y0 * this.Cxorbit[iter];
    dx = term1x + term2x + term3x;
    dy = term1y + term2y + term3y;
   
    // calculate the starting poing for the Derivative Taylor function using A'B'C'    
    term1x = dx0 * this.Apxorbit[iter] - dy0 * this.Apyorbit[iter];
    term1y = dx0 * this.Apyorbit[iter] + dy0 * this.Apxorbit[iter];
    term2x = d2x0 * this.Bpxorbit[iter] - d2y0 * this.Bpyorbit[iter];
    term2y = d2x0 * this.Bpyorbit[iter] + d2y0 * this.Bpxorbit[iter];
    term3x = d3x0 * this.Cpxorbit[iter] - d3y0 * this.Cpyorbit[iter];
    term3y = d3x0 * this.Cpyorbit[iter] + d3y0 * this.Cpxorbit[iter];
    dpx = term1x + term2x + term3x;
    dpy = term1y + term2y + term3y;

    while ((iter < this.maxRefIter) && ((modulus) < 10000)) {

        //******************************************************************************************
        ///// PERTURBATION DELTA FORMULA - EXACT AND NOT APPROXIMATED - Dn+1 = 2*Zn*Dn + Dn*Dn + D0
        // 
        // exact formula (not used here) for the derivative is Z'(n+1)=2*Z(n)*Z'(n) + 1 can be reused for testing
        //*******************************************************************************************
        tx = 2 * (this.Xxorbit[iter] * dx - this.Xyorbit[iter] * dy) + (dx * dx - dy * dy) + dx0;
        ty = 2 * (this.Xyorbit[iter] * dx + this.Xxorbit[iter] * dy) + 2 * dx * dy + dy0;
        

        ///// DERIVATIVE DELTA FORMULA - EXACT AND NOT APPROXIMATED - DZ'n+1 = 2(Z'n*Dn + ZnDZ'n + DZn*DZ'n)
        //*******************************************************************************************
        t = 2 * (this.Xpxorbit[iter] * dx - this.Xpyorbit[iter] * dy + this.Xxorbit[iter] * dpx - this.Xyorbit[iter] * dpy + dx * dpx - dy * dpy);
        dpy = 2 * (this.Xpxorbit[iter] * dy + this.Xpyorbit[iter] * dx + this.Xxorbit[iter] * dpy + this.Xyorbit[iter] * dpx + dy * dpx + dx * dpy);
        dpx = t;

        dx = tx;
        dy = ty;

        iter++;  // we now go to N+1

        // DERIVATIVE
        this.Ypxorbit[iter] = this.Xpxorbit[iter] + dpx;
        this.Ypyorbit[iter] = this.Xpyorbit[iter] + dpy;

        // With the Delta exact forumula
        x = this.Xxorbit[iter] + dx;
        y = this.Xyorbit[iter] + dy;
        this.Yxorbit[iter] = x;
        this.Yyorbit[iter] = y;

        if (deltax == 1.490289804288e-17 && deltay == 1.9793689703807997e-17) {

            //Debug.writeln(iter.toString());
            //Debug.writeln(dy.toString());
        }

        modulus = x * x + y * y;
    
    }

    if (modulus > 10000) {
        // forumula for distance estimate is Dist = log(modulus)* Sqrt(|Z|/|Z'|)
        dist = Math.log(modulus) * Math.sqrt(modulus/(this.Ypxorbit[iter] * this.Ypxorbit[iter] + this.Ypyorbit[iter] * this.Ypyorbit[iter]));
    }
    if (dist == 0) {
     
        if (deltax == 1.490289804288e-17 && deltay == 1.9793689703807997e-17) {
            this.xRef = new Big(cx);
            this.yRef = new Big(cy);
            this.setRefDistance();
        }
     //   for (var h = 0; h < 371; h++)
     //       Debug.writeln(this.Xxorbit[h].toString());
     //   for (var h = 0; h < 371; h++)
     //        Debug.writeln(this.Yxorbit[h].toString());

    //    this.xRef = new Big(cx);
     //   this.yRef = new Big(cy);
     //   this.setRefDistance();
     //   for (var h = 0; h < 198; h++)
      //      Debug.writeln(this.Xxorbit[h].toString());
        Debug.writeln(cx.v.toString());
        Debug.writeln(cy.v.toString());
        
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



//***************************************************************
//         HIGH PRECISION DISTANCE ESTIMATOR FOR REFERENCE POINT
//***************************************************************
MSet.prototype.getDepth = function (cx, cy) {

    var temp = new Big(0);
    var y = new Big(0);
    var x = new Big(0);
    var y2 = new Big(0);
    var x2 = new Big(0);
    var iter = 0;
    var modulus = 0;

    
    while ((iter < this.maxiter) && (modulus < 10000)) {
        temp = (x2.minus(y2).plus(cx));
        y = (x.times(2).times(y).plus(cy));
        x = temp;
        x2 = x.times(x);
        y2 = y.times(y);
        modulus = x2.toFloat() + y2.toFloat();

        iter++; // We now go to N+1
        
    }

    return iter;
}



//********************************************************************************
//
//                           CLONES THE VALUES FROM THE REFERENCE SET
//
//********************************************************************************
MSet.prototype.refCopy = function (m) {

    this.maxiter = m.maxiter;
    this.threshold = m.threshold;
    this.col1 = m.col1;
    this.col2 = m.col2;
    this.col3 = m.col3;

    this.maxRefIter = m.maxRefIter; 
    this.ApproxIndexStart = m.ApproxIndexStart;
    this.xRef = new Big(m.xRef);
    this.yRef = new Big(m.yRef);

    this.Xxorbit = m.Xxorbit
    this.Xyorbit = m.Xyorbit 
    this.Xpxorbit = m.Xpxorbit
    this.Xpyorbit = m.Xpyorbit 

    this.Axorbit = m.Axorbit 
    this.Ayorbit = m.Ayorbit 
    this.Bxorbit = m.Bxorbit
    this.Byorbit = m.Byorbit
    this.Cxorbit = m.Cxorbit
    this.Cyorbit = m.Cyorbit 

    this.Apxorbit = m.Apxorbit;
    this.Apyorbit = m.Apyorbit;
    this.Bpxorbit = m.Bpxorbit;
    this.Bpyorbit = m.Bpyorbit;
    this.Cpxorbit = m.Cpxorbit;
    this.Cpyorbit = m.Cpyorbit;



    
}



//***************************************************************
//         FIND A REFERENCE POINT IN AN IMAGE CONTEXT
//***************************************************************
MSet.prototype.setRefPoint = function (imgBit) {

    if (this.xRef == null) {  // if it is the first time we draw the set then use any value
        this.xRef = new Big("-0.543125817398749032964402");
        this.yRef = new Big("0.616477595085555005437988");
        // this.xRef = new Big("-0.5431258187760327092");
        // this.yRef = new Big("0.6164775955475611892");
        //this.xRef = new Big("-0.5431258187760327091955");
        //this.yRef = new Big("0.6164775955475611892");
        return;
    }


    var blackFound = 0;

    for (var j = 0; j < imgBit.width; j++) {
        for (var i = 0; i < imgBit.height; i++) {

            var index = (j * imgBit.height + i) * 4;
            if (imgBit.imgData.data[index] == 0 && imgBit.imgData.data[index + 1] == 0
            && imgBit.imgData.data[index + 2] == 0 && imgBit.imgData.data[index + 3] == 255) {

                var cx = imgBit.x1.plus(imgBit.xyIncrement.times(new Big(i)));
                var cy = imgBit.y1.minus(imgBit.xyIncrement.times(new Big(j)));
                var depth = this.getDepth(cx, cy);

                if (depth > this.maxRefIter) {
                    this.xRef = cx;
                    this.yRef = cy;
                    this.xyInc = ((imgBit.x2).minus(imgBit.x1)).toFloat() / canvas1.width;
                    return;

                    Debug.writeln("");
                    Debug.writeln(cx.v.toString());
                    Debug.writeln("");
                    Debug.writeln("");
                    Debug.writeln("");


                }

            }

        }
        i = 0; // reset for the next line
    }

    // if nothing was found, then return without setting the valuers
    return;
}
