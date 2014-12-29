

/******************************************************************
      MSetDist
      ========

  Distance estimator for points near the Mandelbrot set.

*******************************************************************/
var ci =0 , ou = 0, n = 0, m=0;

function MSet(maxiter, threshold) 
{
    this.maxiter = 100;
    this.threshold = 15;
    this.xorbit = new Array(10000);/* Stores the orbit of x 	*/
    this.yorbit = new Array(10000);/* Stores the orbit of y 	*/
}


 MSet.prototype.paintDisk = function( i,  j, imgbit)  
{
    m = window.performance.now();
    var x = imgbit.x1 + i / imgbit.pixOverX;
    var y = imgbit.y1 - j / imgbit.pixOverX;

    var dist = 0.25 * this.distance(x, y);
    var radius = Math.floor(dist * imgbit.pixOverX);

    if (radius > 1)
    {
        imgbit.fillDisk(i, j, radius, 50, 50, 200); //draw a circle and fill it. 
        imgbit.drawCircle(i, j, radius, 100, 100, 100);
        //ci = ci + window.performance.now() - m;
        }
    else if (dist > 1 / imgbit.pixOverX / this.threshold)
        {
            imgbit.setPixel(i, j, 0, 0, 255); // the point is just outside the set
            //ou = ou + window.performance.now() - m;
            
        }
    else
        {
        imgbit.setPixel(i, j, 0, 0, 0); // the point is IN the set
        //n = n + window.performance.now() - m;
        
    }
   // document.getElementById('out1').value = n;
   // document.getElementById('out2').value = ci;
   // document.getElementById('out3').value = ou;
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
    
    var n = window.performance.now();

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
    
    document.getElementById('out4').value = window.performance.now() - n;
    return imgbit;
}

