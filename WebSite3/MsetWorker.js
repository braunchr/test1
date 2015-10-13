importScripts("Mset.js");
importScripts("ImageBit.js");
importScripts("Bignum.js");

self.onmessage = function (e) {

    //get the data from the event
    var threshold = e.data.threshold;
  
    var maxiter = e.data.maxiter;
    var px1 = e.data.px1;
    var py1 = e.data.py1;
    var col1 = e.data.col1;
    var col2 = e.data.col2;
    var col3 = e.data.col3;
    var imgData = e.data.imgData;
    var subwidth=e.data.subwidth;
    var subheight = e.data.subheight;
    var precision = e.data.precision;

    var subx1 = new Big(0);
    var subx2 = new Big(0);
    var suby1 = new Big(0);

    subx1['v'] = e.data.subx1['v'];
    subx1['e'] = e.data.subx1['e'];
    subx1['s'] = e.data.subx1['s'];

    subx2['v'] = e.data.subx2['v'];
    subx2['e'] = e.data.subx2['e'];
    subx2['s'] = e.data.subx2['s'];

    suby1['v'] = e.data.suby1['v'];
    suby1['e'] = e.data.suby1['e'];
    suby1['s'] = e.data.suby1['s'];



    var imgbit = new ImageBit(imgData, subx1, suby1, subx2);

    //call the long computation
    var m = new MSet();
    m.refCopy(e.data.refSet); // copies the values of the Reference Set
    m.paint(imgbit);

  
    //formats the data to be returned back to the UI thread
    var workerMessage = {
        imgData: imgbit.imgData,
        px1: Math.round(px1),
        py1: Math.round(py1),
    };

    //post back imagebit to the UI thread
    self.postMessage(workerMessage);
    self.close();

}


