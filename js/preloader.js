/*
 * Copyright (c) 2012 Jason Millward
 *
 * Based on QueryLoader by Gaya Kessler
 *
 *
 *
 */

function secondstotime(secs)
{
    var t = new Date(1970,0,1);
    t.setSeconds(secs);
    var s = t.toTimeString().substr(0,8);
    if(secs > 86399)
        s = Math.floor((t - Date.parse("1/1/70")) / 3600000) + s.substr(2);
    return s;
}

(function($) {
    var debug     = true;

    var start     = new Date().getTime();
    var end       = new Date().getTime();

    var jImageSrc = [];
    var jImageCss = [];



    var qLimageContainer = "";
    var qLoverlay        = "";
    var qLbar            = "";
    var qLpercentage     = "";
    var qLimageCounter   = 0;
    var ajaxCalls        = 0;
    var totalCSS         = 0;
    var totalSRC         = 0;
    var totalDoneCSS     = 0;
    var totalDoneSRC     = 0;
    var totalDone        = 0;
    var qLdestroyed      = false;


    function createPreloadContainer() {
        var i;
        qLimageContainer = $("<div></div>").appendTo("body").css({
            display: "none",
            width: 0,
            height: 0,
            overflow: "hidden"
        });

        for (i = 0; jImageCss.length > i; i++) {
            $.ajax({
                url: jImageCss[i],
                type: 'HEAD',
                success: function(data) {
                    if(!qLdestroyed){
                        qLimageCounter++;
                        totalCSS++;
                        addImageForPreload(this['url'],'css');
                    }
                }
            });
        }

        for (i = 0; jImageSrc.length > i; i++) {
            $.ajax({
                url: jImageSrc[i],
                type: 'HEAD',
                success: function(data) {
                    if(!qLdestroyed){
                        qLimageCounter++;
                        totalSRC++;
                        addImageForPreload(this['url'],'src');
                    }
                }
            });
        }
    }

    function addImageForPreload(url,type) {

        var image = $("<img />").attr("src", url).bind("load", function () {
            completeImageLoading(type);
        }).appendTo(qLimageContainer);

    }

    function completeImageLoading(type) {

        totalDone++;

        if (type == 'src') {
            totalDoneSRC++;
        } else {
            totalDoneCSS++;
        }

        var percentage = (totalDone / qLimageCounter) * 100;
        $('#total').width(percentage+'%');

        if ( totalCSS === 0) {
            $('#css').width('100%');
        } else {
            var percentage2 = (totalDoneCSS / totalCSS) * 100;
            $('#css').width(percentage2+'%');
        }

        if ( totalSRC === 0) {
            $('#src').width('100%');
        } else {
            var percentage3 = (totalDoneSRC / totalSRC) * 100;
            $('#src').width(percentage3+'%');
        }

        if (totalDone == qLimageCounter) {
            qLimageContainer.remove();
            $('.content').fadeIn("slow");
            $('.preloader').fadeOut("fast");

            end = new Date().getTime();
            var time = end - start;

            if (debug) {
                $('#debug').append( "Execution time:        " + secondstotime(time/1000) + "\n" );
                $('#debug').append( "Total Images loaded:   " + qLimageCounter + "\n" );
                $('#debug').append( "CSS Images:            " + totalCSS + "\n" );
                $('#debug').append( "SRC Images:            " + totalSRC + "\n" );
                $('#debug').append( "\n\nControl-F5 to reset the test." );
            }
            qLdestroyed = true;

        }
    }

    function findImageInElement(element) {

        var url  = "";
        var from = "";

        if ($(element).css("background-image") != "none") {
            url = $(element).css("background-image");
            from = "css";
        } else if (typeof($(element).attr("src")) != "undefined" && element.nodeName.toLowerCase() == "img") {
            url = $(element).attr("src");
            from = "src";
        }

        if (url.indexOf("gradient") == -1) {
            url = url.replace(/url\(\"/g, "");
            url = url.replace(/url\(/g, "");
            url = url.replace(/\"\)/g, "");
            url = url.replace(/\)/g, "");

            var urls = url.split(", ");

            for (var i = 0; i < urls.length; i++) {
                if (urls[i].length > 0) {
                    var extra = "?" + Math.floor(Math.random() * 3000);
                    if (from == "src") {
                        jImageSrc.push(urls[i] + extra);
                    } else {
                        jImageCss.push(urls[i] + extra);
                    }
                }
            }
        }
    }

    $.fn.queryLoader2 = function(options) {
        start = new Date().getTime();
        $('.content').hide(0);
        this.each(function() {
            findImageInElement(this);
            $(this).find("*:not(script)").each(function() {
                findImageInElement(this);
            });
        });
        createPreloadContainer();
        return this;
    };

})(jQuery);


$(document).ready(function () {
    $("body").queryLoader2();
});