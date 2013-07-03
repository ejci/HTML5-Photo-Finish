(function(win, doc, nav) {"use strict";
    //X browser
    win.requestAnimationFrame = win.requestAnimationFrame || win.msRequestAnimationFrame || win.mozRequestAnimationFrame || win.webkitRequestAnimationFrame;
    nav.getUserMedia = nav.getUserMedia || nav.oGetUserMedia || nav.msGetUserMedia || nav.mozGetUserMedia || nav.webkitGetUserMedia;

    // Fallback for browsers that don't provide
    // the requestAnimationFrame API (e.g. Opera).
    if (!win.requestAnimationFrame) {
        win.requestAnimationFrame = function(callback) {
            setTimeout(callback, 0);
        };
    }

    // Fallback for browsers that don't provide
    // the URL.createObjectURL API (e.g. Opera).
    if (!win.URL || !win.URL.createObjectURL) {
        win.URL = win.URL || {};
        win.URL.createObjectURL = function(obj) {
            return obj;
        };
    }

    var video, width, height, context, contextDest;
    //UI
    var ui = (function(opt) {
        var cb = function() {
        };
        opt = opt || {
            play : cb,
            pause : cb,
            stop : cb,
            preview : cb
        };
        opt.play = opt.play || cb;
        opt.pause = opt.pause || cb;
        opt.stop = opt.stop || cb;
        opt.preview = opt.preview || cb;

        var overview = $('#overview');
        var playButton = $('#playButton');
        var pauseButton = $('#pauseButton');
        var stopButton = $('#stopButton');
        var previewButton = $('#previewButton');
        var resolutionsButton = $('.resolution');
        var resolutionButton320 = $('#resolutionButton320');
        var resolutionButton640 = $('#resolutionButton640');
        var resolutionButton1280 = $('#resolutionButton1280');
        var enableControl = function() {
            //controls.show();
            $('#controls').show();
            playButton.click(function(e) {
                $('#controls a i').removeClass('icon-spin');
                $(e.target).find('i').addClass('icon-spin');
                opt.play();
            });
            pauseButton.click(function(e) {
                $('#controls a i').removeClass('icon-spin');
                $(e.target).find('i').addClass('icon-spin');
                opt.pause();
            });
            stopButton.click(function(e) {
                $('#controls a i').removeClass('icon-spin');
                $('#results').empty();
                //$(e.target).addClass('icon-spin');
                opt.stop();
            });
            previewButton.click(function(e) {
                $(e.target).toggleClass('active');
                overview.toggle();
                //opt.preview();
            });
            resolutionsButton.click(function(e) {
                stopButton.trigger('click')
                resolutionsButton.removeClass('btn-info');
                $(e.target).addClass('btn-info');
                opt.stop();
                var w = $(e.target).attr('resolution').split('x')[0];
                var h = $(e.target).attr('resolution').split('x')[1];
                $('#videoSource').attr('width', w);
                $('#videoSource').attr('height', h);
                $('#canvasSource').attr('width', w);
                $('#canvasSource').attr('height', h);
                $('#canvasDest').attr('width', w);
                $('#canvasDest').attr('height', h);
            });

        }

        return {
            enableControl : enableControl
        }
    })({
        play : startCapture,
        pause : pauseCapture,
        stop : stopCapture
    });
    //INIT
    function initialize() {
        //video source
        video = doc.getElementById("videoSource");
        width = video.width;
        height = video.height;
        //source image/canvas
        var canvas = doc.getElementById("canvasSource");
        context = canvas.getContext("2d");
        //destination canvas
        var canvasDest = doc.getElementById("canvasDest");
        contextDest = canvasDest.getContext("2d");

        //get stream (TODO: open .mp4 video?)
        nav.getUserMedia({
            video : true,
            audio : false
        }, mediaReady, function() {
        });
    }

    //media is ready
    function mediaReady(stream) {
        video.src = URL.createObjectURL(stream);
        video.play();
        ui.enableControl();
        //startStep();
    }

    var capturing = false;
    function step() {
        if (capturing) {
            requestAnimationFrame(step);
            draw();
        }
    }

    function startCapture() {
        if (!capturing) {
            width = video.width;
            height = video.height;

            capturing = true;
            step();
        }
    }

    function pauseCapture() {
        capturing = false;
    }

    function stopCapture() {
        //stop
        rows = 0;
        capturing = false;
        //empty
        contextDest.clearRect(0, 0, width, height);
    }

    var rows = 0;
    function draw() {
        var size = 2;
        context.drawImage(video, 0, 0, width, height);
        var snapshot = context.getImageData(width - 100, 0, size, height);
        //replaceGreen(frame.data, copyFrame.data);
        //var data = getPixels(frame.data);
        var oldImage = contextDest.getImageData(0, 0, width, height);
        contextDest.putImageData(oldImage, size, 0);
        contextDest.putImageData(snapshot, 0, 0);
        rows += size;
        if (rows >= width) {
            var url = canvasDest.toDataURL("image/png");
            var newImg = $('<img class="result"/>');
            newImg.attr('src', url);
            $('#results').prepend(newImg);
            newImg = null;
            rows = 0;
        }
    }

    //init app
    addEventListener("DOMContentLoaded", initialize);
})(window, document, navigator);
