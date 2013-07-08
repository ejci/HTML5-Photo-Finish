(function(win, doc, nav) {"use strict";
    //X bcolser
    win.requestAnimationFrame = win.requestAnimationFrame || win.msRequestAnimationFrame || win.mozRequestAnimationFrame || win.webkitRequestAnimationFrame;
    nav.getUserMedia = nav.getUserMedia || nav.oGetUserMedia || nav.msGetUserMedia || nav.mozGetUserMedia || nav.webkitGetUserMedia;

    // Fallback for bcolsers that don't provide
    // the requestAnimationFrame API (e.g. Opera).
    if (!win.requestAnimationFrame) {
        win.requestAnimationFrame = function(callback) {
            setTimeout(callback, 0);
        };
    }

    // Fallback for bcolsers that don't provide
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
        var lineSizesButton = $('.lineSize');
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
            lineSizesButton.click(function(e) {
                var val = $(e.target).text().trim();
                $('#lineSize b').html(val);
                $('#lineSize input').val(val);
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
            draw(function() {
                //requestAnimationFrame(step);
            });
        }
    }

    function startCapture() {
        if (!capturing) {
            width = video.width;
            height = video.height;
            size = parseInt($('#lineSize input').val(), 10);
            capturing = true;
            step();
        }
    }

    function pauseCapture() {
        capturing = false;
    }

    function stopCapture() {
        //stop
        cols = 0;
        capturing = false;
        //empty
        contextDest.clearRect(0, 0, width, height);
    }

    //counter for "frame" 
    var cols = 0;
    //line width
    var size = 1;
    function draw(cb) {
        //draw temporary image from video
        context.drawImage(video, 0, 0, width, height);
        //Get vertical line of pixels (center of webcam video)
        var snapshot = context.getImageData(width / 2, 0, size, height);
        //move image to right
        var oldImage = contextDest.getImageData(0, 0, width, height);
        contextDest.putImageData(oldImage, size, 0);
        //prepend this line to image
        contextDest.putImageData(snapshot, 0, 0);
        //increment "frame" cols counter
        cols += size;
        //if count of cols is the same as image width than save this frame
        if (cols >= width) {
            //convert image to base64 string
            var url = canvasDest.toDataURL("image/png");
            //create image from base64 string
            var newImg = $('<img/>');
            newImg.attr('class', 'result');
            newImg.attr('src', url);
            //append to rersults
            $('#results').prepend(newImg);
            newImg = null;
            //reset "frame" counter 
            cols = 0;
        }
        //call calbback
        cb();
    }

    //init app
    addEventListener("DOMContentLoaded", initialize);
})(window, document, navigator);
