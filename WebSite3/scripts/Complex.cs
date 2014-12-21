
class Complex
{

    /*****************************************************************************
        FUNCTION: Various Complex Functions

        PURPOSE: Little Complex Arithmetic Library to ease some
                    of the computations in the main function.

    *******************************************************************************/


    public double x;
    public double y;

    public Complex(double x, double y)
    {
        this.x = x;
        this.y = y;
    }


    public Complex()
    {
        this.x = 0;
        this.y = 0;
    }

    public Complex cprod(Complex z1, Complex z2)
    {
        return (new Complex(z1.x * z2.x - z1.y * z2.y, z1.x * z2.y + z1.y * z2.x));
    }

    public Complex csum(Complex z1, Complex z2)
    {
        return (new Complex(z1.x + z2.x, z1.y + z2.y));
    }

    public Complex csub(Complex z1, Complex z2)
    {
        return (new Complex(z1.x - z2.x, z1.y - z2.y));
    }


    public Complex cdiv(Complex z1, Complex z2)
    {
        double module = z2.cmod();
        return (new Complex((z1.x * z2.x - z1.y * z2.y) / module, (z1.y * z2.x - z1.x * z2.y) / module));
    }

    public double cmod()
    {
        return (System.Math.Sqrt(x * x + y * y));
    }

    public double theta()
    {
        return (System.Math.Atan2(x, y));
    }

}

