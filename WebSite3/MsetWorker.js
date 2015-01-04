importScripts("Mset.js");
importScripts("ImageBit.js");

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
    var subx1 = e.data.subx1;
    var subx2 = e.data.subx2;
    var suby1 = e.data.suby1;

    var imgbit = new ImageBit(imgData, subwidth, subheight, subx1, suby1, subx2);

    //call the long computation
    var m = new MSet(maxiter, threshold, col1, col2, col3);
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


