importScripts("Mset.js");
importScripts("ImageBit.js");

self.onmessage = function (e) {

    //get the data from the event
    var imgbit = new ImageBit(e.data.imgbit.imgData, e.data.imgbit.width, e.data.imgbit.height, e.data.imgbit.x1, e.data.imgbit.y1, e.data.imgbit.x2);
    var threshold = e.data.threshold;
    var maxiter = e.data.maxiter;

    //call the long computation
    var m = new MSet(maxiter, threshold);
    m.paint(imgbit);

    //formats the data to be returned back to the UI thread
    var workerMessage = {
        imgbit: imgbit
    };

    //post back imagebit to the UI thread
    self.postMessage(workerMessage);

}

