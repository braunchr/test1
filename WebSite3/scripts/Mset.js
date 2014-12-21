

/******************************************************************
      MSetDist
      ========

  Distance estimator for points near the Mandelbrot set.

*******************************************************************/

function MSet(maxiter, threshold) 
{
    this.maxiter = 100;
    this.threshold = 15;
    this.xorbit = new Array(10000);/* Stores the orbit of x 	*/
    this.yorbit = new Array(10000);/* Stores the orbit of y 	*/
    this.flag = false;
    this.temp = 0;			/* Real scratch variable	*/
    this.dist = 0;			/* Distance returned 		*/
}


 MSet.prototype.paintDisk = function( i,  j, imgbit)  
{
    var x = imgbit.x1 + i / imgbit.pixOverX;
    var y = imgbit.y1 - j / imgbit.pixOverX;

    var dist = 0.25 * this.distance(x, y);
    var radius = Math.floor(dist * imgbit.pixOverX);

    if (radius > 1)
    {
        imgbit.fillDisk(i, j, radius, 200, 200, 200);
        imgbit.drawCircle(i,j,radius,150,150,150)
        }
        else if (dist > 1 / imgbit.pixOverX / this.threshold)
        {
            imgbit.setPixel(i, j, 0,0,255);
        }
        else
        {
            imgbit.setPixel(i, j, 0,0,0);
    }
}


MSet.prototype.distance = function(cx, cy)
{
   
    var iter, i;
    var x2, y2;			        /* Squares of x and y 		*/
    var x, y;                   /* Real and imaginary part  	*/
    var xdc = 0, ydc = 0;		/* Derivatives	in c	  	*/

    x = y = x2 = y2 = this.dist = this.xorbit[0] = this.yorbit[0] = iter = 0;

 
    while ((iter < this.maxiter) && ((x2 + y2) < 10000))
    {
        this.temp = x2 - y2 + cx;
        y = 2 * x * y + cy;
        x = this.temp;
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
        this.flag = false;
        while ((i < iter) && (this.flag == false))
        {
            this.temp = 2 * (this.xorbit[i] * xdc - this.yorbit[i] * ydc) + 1;
            ydc = 2 * (this.yorbit[i] * xdc + this.xorbit[i] * ydc);
            xdc = this.temp;
            this.flag = (Math.max(Math.abs(xdc), Math.abs(ydc)) > 1e300);
            i++;
        }
        if (this.flag == false)
            this.dist = Math.log(x2 + y2) * Math.sqrt(x2 + y2) / Math.sqrt(xdc * xdc + ydc * ydc);
    }
    return this.dist;
}


MSet.prototype.paint = function (imgbit) {
    
    for (var j = 0; j < imgbit.height; j++)
    {
        for (var i = 0; i<imgbit.width; i++)
        {
            if (imgbit.imgData.data[4 * (j*imgbit.width + i)] == 255) //only iterate if the bit is unpainted.
            {
                this.paintDisk(i, j, imgbit);
            }
        }
        
    }


    return imgbit;
}

