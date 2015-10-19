

var bp = 7; // number of digits per token. Store the base in power of 10 - range 1-7 - if 8 or over, then the multiplicatin will result in 16 digits which exceeds the javascript maximum of 2^32
var base = Math.pow(10, bp);
var PRECISION =10;  // maximum number of tokens

//**************************************************************************************
//                         C O N S T R U C T O R

// Constructor for the bignum structure 
// stored in an array of integer "tokens" or precision bp defined as a constant (1=7)
// the structure of the bignum is 
// "s" for sign, "e" for exponent" and "v" for the array value
// The least significant token is stored in V[0] (the reverse from normal notation) 
// The constructor accepts a string as a prarameter. 
// This is a scientific notation string starting with a sign (or nothing for +) 
//**************************************************************************************

function Big(n) {

    this.e = 0;
    this.v = new Array();
    this.s = 0;

    var i, j, nl;
    var dp = 0;
    var ex = 0;
    var base_e;
    var rem_e;
    var ina = new Array();      //Array to store the integer part 
    var dpa = new Array();      //Array to store the decimal point part 


    if (n == null) return;      // if no argument was passed,return a Big of value 0

    if (!isNaN(n)) n = n.toString();   // if a number was passed, transform it in a string 

    if (n instanceof Object || n instanceof Big){ // if we want to clone. testing for objects because workers do not preserve the type
        this.e = n.e;
        this.v = n.v;
        this.s = n.s;
        return;
    }

    n = n.replace(/\s+/g, ''); // remove all the spaces

    //this.s = (n.charAt(0) == '-' || n.charAt(0) == '+') ? (n = n.slice(1), -1) : 1; //store and strip the sign

    this.s = 1;  // by default, the sign is positive

    if (n.charAt(0) == '+') {  //Ignore the sign "+" if there was one
        n = n.slice(1),-1;
    }

    if (n.charAt(0) == '-') {  //If there was a negative sign, strip it and Change the sign of the result. 
        n = n.slice(1),-1;
        this.s = -1;
    }

    if ((dp = n.indexOf('.')) >= 0) { // Decimal point?
        n = n.replace('.', '');
        ex = dp;
    }

    if ((i = n.search(/e/i)) > 0) { // search for the character E or e
        (dp < 0) ? ex = i : ex = dp; // if there is no decimal point, set ex to length otherwise dp
        ex = ex + parseInt(n.slice(i + 1));  // add to ex whatever number follows character E
        n = n.slice(0, i); // cut the exponential part off the string so we only have the start

    } else if (dp < 0) {  // if we dont find char E and there are no DP, then it's an integer
        ex = n.length;
    }

    // Determine leading zeros
    for (var lz = 0; n.charAt(lz) == '0'; lz++) { }  // count the number of leading zeros in lz     

    if (lz == (n.length)) { // the string is just a series of Zeros
        this.v[0] = this.e[0] = 0;
        return;
    }


    for (var tz = 0 ; n.charAt(n.length - 1 - tz) == '0'; tz++) { }  // count how many trailin zeros
    n = n.slice(lz, n.length - tz);  // remove the leading and trailing zeros. 
    ex = ex - lz - 1; // adjust the exponent for leading and trailing zeros

    // At this stage we have a clean number in base 10 with ex representing the exponent in scientific notation
    // the string n is also in scientific notation without a decimal point, assuming the first digit is the unit.
    // we now have to convert base 10 in the base of the bignum.

    this.e = Math.floor(ex / bp); // the exponent conversion is trivial, simply the division

    if (ex < 0) {  // if the final number has still negative exponent shift the string to be a multiple of bp

        ex = (-ex - 1) % bp;
        for (i = 0; i < ex; i++)  // pad zeros before N
            n = "0" + n;

        for (i = 0; i < n.length % bp; i++)  // pad the remaining zeros after N
            n = n + "0";

    }
    else {  // if the exponent is positive

        nl = n.length;
        if (ex + 1 < nl) { //there is a decimal point. We have to adjust the padding to get the dp as a multiple of the base. 
            if ((nl - (ex + 1)) % bp != 0)
                for (i = 0; i < bp - (nl - (ex + 1)) % bp ; i++) //pad with zeros to make this multiple of bp. only pad the numbers after the decimal point
                    n = n + "0";
        }
        else { // there is no decimal point so just add as many zeros after nl to go to ex+1 (modulo bp)
            if (((ex + 1) - nl) % bp != 0)
                for (i = 0; i < ((ex + 1) - nl) % bp ; i++) //pad with zeros to make this multiple of bp. 
                    n = n + "0";
        }
    }

    i = 0; // counter
    while (n.length > 0) {
        this.v[i++] = parseInt(n.substr(-bp)); //store the last batch of characters of the string first. the string is stored back to front. 
        n = n.slice(0, -bp);
    }

}

//**************************************************************************************
//                                  T O    F L O  A  T
//
// Converts the big number in a float number with a given number of tokens
//**************************************************************************************

Big.prototype.toFloat = function() { //n is optionally the number of tokens to parse

    var res = 0;
    var n = Math.min(this.v.length, 1 + Math.floor(17 / bp)); //n is however many tokens fit in a floating number

    for (var i = 1 ; i <= n; i++) {
        res += this.v[this.v.length - i] * Math.pow(base, this.e - i + 1);
    }

    res = res * this.s;

    return res;
}

//**************************************************************************************
//                                  F O R M A T 
// this method simply formats a bignum in a decimal string so that it can be displayed
//**************************************************************************************

Big.prototype.toString = function (numTokens) {  // n is the number of tokens to display 

    
    // start with the sign
    var st = (this.s == 1) ? '+' : '-';
    var v = this.v;
    var e = this.e.toString();
    var tok1 = v[v.length - 1].toString();
    var maxLength = 0;
    if (!isNaN(numTokens)) maxLength = v.length - numTokens;  // if a precision was passed, then store it. 


    //add the first token and the decimal point
    //st = st.concat(tok1.toString(), '.');
    st = st.concat(tok1.slice(0, 1), '.', tok1.slice(1));


    for (var i = v.length - 2; i >= 0 && i >= maxLength ; i--) {

        for (var pad = bp; v[i].toString().length < pad; pad--) { st = st.concat('0'); } //pad with zeros
        st = st.concat(v[i].toString());
    }

    // remove trailing zeros
    st = st.replace(/^0+|0+$/g, "")


    st = st.concat(' E', e * bp + tok1.length - 1);
    return (st);
}


//**************************************************************************************
//                               M U L T I P L I C A T I O N 
//**************************************************************************************
// this function multiplies a big number (this) by another number (y) big number or integer.

Big.prototype.times = function (y, prec) {
    var res = new Big(); // to store the result
    var x = this; 
    if (!isNaN(prec)) PRECISION = prec;  // if a prec was passed, set the precision.

    if (y instanceof Big) {

        // check if x is zero
        if (x.v[x.v.length - 1] == 0) {
            res.s = 1;
            res.e = 0;
            res.v[0] = 0;
            return res;
        }

        // check if y is zero
        if (y.v[y.v.length - 1] == 0) {
            res.s = 1;
            res.e = 0;
            res.v[0] = 0;
            return res;
        }

        // The sign of the result is -1 if the factor signs are the same, -1 otherwise. 
        res.s = (x.s == y.s) ? 1 : -1;

        // initialises the array to store the result. We have to initialise it to Zero because we add to it in the body. 
        for (var ind = 0 ; ind < x.v.length + y.v.length; ind++)
            res.v[ind] = 0;

        for (var i = 0; i < x.v.length; i++)     // this is the main loop. it is o(N2) in length because it's a double loop. 
            for (var j = 0; j < y.v.length; j++) {
                var t = x.v[i] * y.v[j] + res.v[i + j];  // store the result of the multiplication and add any previously held carry. 
                res.v[i + j] = t % base;  //remainder
                if (t >= base) {// if we have a carry, add it to the next token    
                    res.v[i + j + 1] += ~~(t / base); //use the bitwise operator to truncate 32 bits before adding it.    
                }
            }
        
        var significantDigit = res.v[i+j-1];
        if (significantDigit == 0) { // if the last element is zero - this is the most significant token
            res.v.pop();  // remove it because we have no carry and no need for leading zeros]
            res.e = x.e + y.e;
        }
        else {
            res.e = x.e + y.e + 1;
        }
      
        if (significantDigit >= base) {  // this can happen because we allow for integer multiplication, so sometimes the last digit is larger than base - in this case, shift again
            res.v[i + j - 1] = significantDigit % base;
            res.v[i + j] = ~~(significantDigit / base);
            (res.e)++;
        }

        //Remove trailing zeros and rounds for precision by truncating from the least significant digit
        while ((res.v[0] == 0 && res.v.length > 1) || (res.v.length > PRECISION))
            res.v.shift();

        return res;

    } else {  // if y was passsed as a number which we assume is an integer

        if (y == 0) {
            res.s = 1;
            res.e = 0;
            res.v[0] = 0;
            return res;
        }

        if (y < 0) {  // deal with the sign and ensure that y is always positive
            res.s = -x.s;
            y = -y;
        }
        else {
            res.s = x.s
        }
        
        res.e = x.e;
       
        for (var i = 0; i < x.v.length; i++) {   // multiply every token by the integer. This works because base is less or equal to 7 and we have no overflow
            res.v[i] = x.v[i] * y; //perform the multiplication.  
        }

        return res;
    }
}


//**************************************************************************************
//                               I N T E G E R     D I V I S I O N  
//**************************************************************************************
// this function divides a big number (this) by an integer (y). we assume y is not zero.

Big.prototype.divint = function (y, prec) {

    var res = new Big(); // to store the result
    var x = this;

    if (!isNaN(prec)) PRECISION = prec;  // if a prec was passed, set the precision.

    // The sign of the result is the same unless y is negative. 
    res.s = (y > 0) ? x.s : -x.s;

    var q = 0;
    var i = x.v.length - 1;
    var r = x.v[i];
    var rl = 0;   // length of the result
    res.e = x.e;

    while ((rl < PRECISION) && ((i >= 0) || (r != 0))) {
        i--;
        q = Math.floor(r / y);
        rl = res.v.unshift(q); // store the digits at the start of the array. unshift returns the new length
        if (res.v[rl - 1] == 0) { // if there is a leading zero
            res.v.pop(); // remove the leading zero
            res.e -= 1;  // decrement the exponent
            rl--;  // make sure you dont count the zero as a significant digit in the comparison with PRECISION
        }
        r = base * (r % y) + (isNaN(x.v[i]) ? 0 : x.v[i])  // this is the new number to divide in the next iteration
    }

    return res;
}

//**************************************************************************************
//                                  A D D I T I O N 
//**************************************************************************************

Big.prototype.plus = function (y, prec) {

    var res = new Big();
    var x = this;

    // check if x is zero
    if (x.v[x.v.length - 1] == 0) {
        res.s = y.s;
        res.e = y.e;
        res.v = y.v.slice(0); // clones the array
        return res;
    }

    // check if y is zero
    if (y.v[y.v.length - 1] == 0) {
        res.s = x.s;
        res.e = x.e;
        res.v = x.v.slice(0);  // clones the array
        return res;
    }


    if (x.s != y.s) { // if the addition is between 2 numbers with different signs, it is a subtraction
        if (x.s == -1) { 
            x.s = -x.s; // change the sign of x
            res = y.minus(x, prec);  //perform a subtraction instead of an addition
            x.s = -x.s; // put the sign of x back to its original state
            return res;
        } else {
            y.s = -y.s; // change the sign of y
            res = x.minus(y, prec);  //perform a subtraction instead of an addition
            y.s = -y.s; // put the sign of y back to its original state
            return res;
        }
    }

    var eo = x.e - y.e; // the exponent offset between the 2 numbers
    var carry; // flag
    var so; // starting offset
    var reslen; // store the length of the result

    res.s = x.s;  // the sign of the result is the sign of any numbers

    if (!isNaN(prec)) PRECISION = prec;  // if a prec was passed, set the precision.

    if (eo < 0) {  // first ensure that x is always bigger than y (otherwise simply swap) 
        x = y;
        y = this;
        eo = -eo;
    }

    // set the exponent of the result to be the same as the largest exponent
    // there still could be a carry which will be dealt later by testing for it.
    res.e = x.e;

    reslen = Math.max(x.v.length, y.v.length + eo); // stores the assumed length of the result. It is the length of the largest number
    xo = x.v.length - x.e - 1;  // the x offset represents the number of digits after the decimal points of x . Will be needed to align
    yo = y.v.length - y.e - 1;  // the y offset represents the number of digits after the decimal points of y . Will be needed to align

    // check if the distance between the numbers is beyond the precision, then the addition and/or the subtraction does not need to be done as one number dwarfs the other. 
    // simply return x after copying it into res
    if (Math.abs(xo - yo) > PRECISION) {
        for (var i = 0; i < x.v.length; i++) res.v[i] = x.v[i];
        return res;
    }

    // to align the numbers, we have to shift xo and yo until one is zero and the otherone negative. Always keep the same distance.
    // First if they both are negative (for example for large exponents if we have trailing zeros)
    while (xo < 0 && yo < 0) { xo++; yo++ };  // tets with 1e5 and 1e7

    // Second if one of them is positive. Shift down so that the largest one (whichever that is) lands at zero. This is where we start the addition. 
    while (xo > 0 || yo > 0) { xo--; yo-- };  // test with 1 and 1e-2 or 1.234 and 1e-1.  

    // at this point, the numbers are aligned with their offsets in place xo and yo. One is zero and the other negative. 
    // if the lentgh of the result is greater than the required precision, then 
    // truncate to the precision. for example 10^3 + 10^-7
    // this will be done by starting the addition of x and y at the Starting Offset (SO).
    (reslen > PRECISION) ? so = reslen - PRECISION : so = 0;

    for (var i = so; i < reslen; i++) { //loop for the main addition start at so
        carry = false;

        // add the digits of x and y and the carry. For each of them test if they are null first in which case use zero
        res.v[i - so] = (isNaN(x.v[i + xo]) ? 0 : x.v[i + xo]) + (isNaN(y.v[i + yo]) ? 0 : y.v[i + yo]) + (isNaN(res.v[i - so]) ? 0 : res.v[i - so]);

        if (res.v[i - so] >= base) { // if there is a carry, only store
            res.v[i - so + 1] = (isNaN(res.v[i - so + 1]) ? 0 : res.v[i - so + 1]) + 1;
            res.v[i - so] = res.v[i - so] - base;
            carry = true;
        }
    }

    if (carry) res.e += 1; // if there was a carry at the most significant digit (which is the last loop), then the exponent goes up

    return res;
}

//**************************************************************************************
//                                  S U B T R A C T I O N
//**************************************************************************************

Big.prototype.minus = function (y, prec) {

    var res = new Big();
    var x = this;

    // check if y is zero
    if (y.v[y.v.length - 1] == 0) {
        res.s = x.s;
        res.e = x.e;
        res.v = x.v.slice(0); // clones the array
        return res;
    }

    // check if x is zero
    if (x.v[x.v.length - 1] == 0) {
        res.s = -y.s;
        res.e = y.e;
        res.v = y.v.slice(0); // clones the array
        return res;
    }


    if (x.s != y.s) { // if the subtraction is between 2 numbers with different signs, it is an addition
        y.s = -y.s;  // swap the sign of y
        res = x.plus(y, prec);  //perform an addition instead of a subtraction
        y.s = -y.s; // put the sign of y back to its original state
        return res;
    }

    var eo = x.e - y.e; // the exponent offset between the 2 numbers
    var carry; // flag
    var so; // starting offset
    var reslen; // store the length of the result
    var signswap = 1;

    if (!isNaN(prec)) PRECISION = prec;  // if a prec was passed, set the precision.

    if (x.compare(y) > 0 ) { // first ensure that x is always bigger than y in absolute value 
        if(x.s==1){ // for example 7-4
            res.s = 1;  // the sign of the result is the sign of the largest exponent number  (subject to a carry which we will test later) 
            res.e = x.e; // the exponent of the result is the same as that of the largest number  (subject to a carry which we will test later) 
        }
        else { // for example (-4) - (-7) swap x and y
            eo = -eo;
            res.s = 1;
            res.e = y.e;
            x = y;
            y = this;
        }
    }
    else {
        if (x.s == -1) { // for example (-7) - (-4)
            res.s = -1;  // the sign of the result is the sign of the largest exponent number  (subject to a carry which we will test later) 
            res.e = x.e; // the exponent of the result is the same as that of the largest number  (subject to a carry which we will test later) 
        }
        else { // for example 4-7  swap x and y
            eo = -eo;
            res.s = -1;
            res.e = y.e;
            x = y;
            y = this;
        }
    }
    
    reslen = Math.max(x.v.length, y.v.length + eo); // stores the assumed length of the result. It is the length of the largest number
    xo = x.v.length - x.e - 1;  // the x offset represents the number of digits after the decimal points of x . Will be needed to align
    yo = y.v.length - y.e - 1;  // the y offset represents the number of digits after the decimal points of y . Will be needed to align

    // check if the distance between the numbers is beyond the precision+1 to accomodate for rounding, then the addition and/or the subtraction does not need to be done as one number dwarfs the other. 
    // simply return x after copying it into res
    if (Math.abs(xo-yo)>PRECISION) {
        for (var i = 0; i < x.v.length; i++) res.v[i] = x.v[i];
        return res;
    }

    // to align the numbers, we have to shift xo and yo until one is zero and the otherone negative. Always keep the same distance.
    // First if they both are negative (for example for large exponents if we have trailing zeros)
    while (xo < 0 && yo < 0) { xo++; yo++ };  // tets with 1e5 and 1e7

    // Second if one of them is positive. Shift down so that the largest one (whichever that is) lands at zero. This is where we start the subtraction. 
    while (xo > 0 || yo > 0) { xo--; yo-- };  // test with 1 and 1e-2 or 1.234 and 1e-1.  

    // at this point, the numbers are aligned with their offsets in place xo and yo. One is zero and the other negative. 
    // if the lentgh of the result is greater than the required precision, then 
    // truncate to the precision. for example 10^3 + 10^-7
    // this will be done by starting the subtraction of x and y at the Starting Offset (SO).

    (reslen > PRECISION) ? so = reslen - PRECISION : so = 0;

    for (var i = so; i < reslen; i++) { //loop for the main addition start at so
        carry = false;
        // subtract the digits of y from x and the carry. For each of them test if they are null first in which case use zero
        res.v[i - so] = (isNaN(x.v[i + xo]) ? 0 : x.v[i + xo]) - (isNaN(y.v[i + yo]) ? 0 : y.v[i + yo]) + (isNaN(res.v[i - so]) ? 0 : res.v[i - so]);

        if (res.v[i - so] < 0) { // if there is a carry, only store
            res.v[i - so + 1] = (isNaN(res.v[i - so + 1]) ? 0 : res.v[i - so + 1]) - 1;
            res.v[i - so] = res.v[i - so] + base;
            carry = true;
        }
    }

    if (carry) res.e -= 1; // if there was a carry at the most significant digit (which is the last loop), then the exponent goes down 

    while (res.v[res.v.length - 1] == 0) { // if the most significant digit is zero and there are more digits
        res.v.pop(); //remove leading zeros
        res.e -= 1; //shift the exponent
    }

    if (res.v.length == 0) {  // the result of the subtraction was zero, then return zero
        res.v[0] = 0;
        res.e = 0;
        res.s = 1;
    }

    return res;
}


//**************************************************************************************
//                                  C O M P A R I S O N S
//**************************************************************************************
// this function returns 1 if x is larger than y, -1 if x is smaller than y and 0 if x equals y
//
Big.prototype.compare = function (y) {

    if (y instanceof Big) { // if y is passed as a bignum instead of an integer

        var x = this;
        var xt, yt, i, numiter;

        if (x.s == 1 && y.s == -1) return 1; // compare the signs first
        if (x.s == -1 && y.s == 1) return -1;

        // at this stage, we know the signs are the same , check if x or y are zero

        if (x.v == 0 && y.v == 0) return 0; // both numbers are zero
        else if (x.v == 0 && y.v != 0)
            return (y.s == 1) ? -1 : 1; // then compare the exponents
        else if (y.v == 0 && x.v != 0)
            return (x.s == 1) ? 1 : -1; // then compare the exponents

        // at this stage, we know the signs are the same and the numbers are not zero

        if (x.e > y.e)
            return (x.s == 1) ? 1 : -1; // then compare the exponents
        if (x.e < y.e)
            return (x.s == -1) ? 1 : -1; // then compare the exponents


        // at this stage the exponents are the same and the signs are the same

        if (x.v.length > y.v.length) {
            numiter = x.v.length;
            xo = 0;
            yo = x.v.length - y.v.length;
        }
        else {
            numiter = y.v.length;
            yo = 0;
            xo = y.v.length - x.v.length;
        }

        for (i = numiter - 1; i >= 0; i--) {
            xt = isNaN(x.v[i - xo]) ? 0 : x.v[i - xo];
            yt = isNaN(y.v[i - yo]) ? 0 : y.v[i - yo];

            if (xt > yt) return (x.s == 1) ? 1 : -1; // x has the largest absolute value
            else if (xt < yt) return (x.s == 1) ? -1 : 1; // y has the largest absolute vaule

        }

        return 0; // at this point, we have finished looping, so the two numbers are equal
    }

    else {  // if y was passed as a number instead of a big number, we take an approximation of the number as the first digit
       
        xapprox = this.s * this.v[this.v.length - 1] * Math.pow(10, this.e * bp);

        if (xapprox > y) return 1;
        if (xapprox < y) return -1;
        if (xapprox = y) return 0;

    }
}



//**************************************************************************************
//                                  C L O N E
//**************************************************************************************
// this function returns 1 if x is larger than y, -1 if x is smaller than y and 0 if x equals y
//
Big.prototype.clone = function (y) {

    var res = new Big(y);

}

