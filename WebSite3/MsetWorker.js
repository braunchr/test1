importScripts("Mset.js");
importScripts("ImageBit.js");

var oo;

self.onmessage = function (e) {

    //get the data from the event
    var imgbit = new ImageBit(e.data.imgbit.imgData, e.data.imgbit.width, e.data.imgbit.height, e.data.imgbit.x1, e.data.imgbit.y1, e.data.imgbit.x2);
    var threshold = e.data.threshold;
    var maxiter = e.data.maxiter;
    var px1 = e.data.px1;
    var py1 = e.data.py1;
    var col1 = e.data.col1;
    var col2 = e.data.col2;
    var col3 = e.data.col3;

    oo=e.data.workerID;

    //call the long computation
    var m = new MSet(maxiter, threshold, col1, col2, col3);
    m.paint(imgbit);

    //formats the data to be returned back to the UI thread
    var workerMessage = {
        imgbit: imgbit,
        px1: Math.round(px1),
        py1: Math.round(py1),
    };

    //post back imagebit to the UI thread
    self.postMessage(workerMessage);
    self.close();

}


