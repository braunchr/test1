

/******************************************************************
      MSetDist
      ========

  Distance estimator for points near the Mandelbrot set.

*******************************************************************/
function MSet(maxiter, threshold) 
{
    this.maxiter = maxiter;
    this.threshold = threshold;
    this.xorbit = new Array(10000);/* Stores the orbit of x 	*/
    this.yorbit = new Array(10000);/* Stores the orbit of y 	*/
}


 MSet.prototype.paintDisk = function( i,  j, imgbit)  
{
    var x = imgbit.x1 + i / imgbit.pixOverX;
    var y = imgbit.y1 - j / imgbit.pixOverX;

    var dist = 0.25 * this.distance(x, y);
    var radius = Math.floor(dist * imgbit.pixOverX);

    if (radius > 1)
    {
        imgbit.fillDisk(i, j, radius, 50, 50, 100); //draw a circle and fill it. 
        }
    else if (dist > 1 / imgbit.pixOverX / this.threshold && dist < 4 / imgbit.pixOverX / this.threshold)
        {
            imgbit.setPixel(i, j, 0, 255, 0); // the point is just outside the set
    }
    else if (dist > 1 / imgbit.pixOverX / this.threshold && dist >= 4 / imgbit.pixOverX / this.threshold) {
        imgbit.setPixel(i, j, 255, 50, 100); // the point is just outside the set
    }
    else
        {
        imgbit.setPixel(i, j, 0, 0, 0); // the point is IN the set
    }
}


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


MSet.prototype.paint = function (imgbit) {
    
    for (var j = 0; j < imgbit.height; j++)
    {
        for (var i = 0; i<imgbit.width; i++)
        {
            if (imgbit.imgData.data[4 * (j*imgbit.width + i)+3] == 0) //only paint if the pixel is transparent.
            {
                this.paintDisk(i, j, imgbit);
            }
        }
        
    }
    return imgbit;
}

