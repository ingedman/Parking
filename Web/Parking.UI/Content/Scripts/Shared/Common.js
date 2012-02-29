﻿/**
* Common scripts for the application. 
* 
* =reference spin.js
*
* @license Copyright 2012. The JSONS
*/
namespace("Parking.Common");

(function($, parking) {
    var common  = parking["Common"]; 

    /**
     * Displays a global error modal box
     *
     * @param {string} message
     */
    common.DisplayGlobalError = function(message) {
        $(".js-globalError .message").html(message)
        $(".js-globalError").modal()
    };

    /**
     * Sets a prefilter to send the session token as a custom header
     * so requests to the api can be made.
     *
     * @param {string} token
     */
    common.SetupAjaxToken = function(token) { 
        common._ajaxTokenPrefilterToken = function(options, originalOptions, xhr) {
            xhr.setRequestHeader('x-parking-token', token);
        };

        common._ajaxTokenPrefilterBlank = function(options, originalOptions, xhr) {  };
        
        common._ajaxTokenPrefilter = function() { 
            common._ajaxTokenPrefilterToken.apply(this, arguments);
        };

        $.ajaxPrefilter(function() { common._ajaxTokenPrefilter.apply(this, arguments); });

    };

    /**
     * Clears out the session token from the prefilter. 
     */
    common.ClearAjaxToken = function() {
         common._ajaxTokenPrefilter = function() { 
            common._ajaxTokenPrefilterBlank.apply(this, arguments); 
         }; 
    };

    /**
     * Sets jquery ajax base methods
     */
    common.SetupAjaxErrorHandler = function () {
        $.ajaxSetup({
            "complete": function(data) { 
                if(data.status == 200) { 
                    try {
                        var message = JSON.parse(data["responseText"]); 
                        
                        if(message["Error"] == true ) {
                            if(message["IsGlobalError"] == true) {
                                common.DisplayGlobalError(message["Response"] + "<br /><br /><strong>StackTrace: </strong><br /><span style='font-size:10px;'>" + message["StackTrace"].replace("\n","<br />") + "</span>");
                                // Log
                            }

                            if(message["Type"] == "InvalidTokenException") {
                                common.DisplayGlobalError(message["Response"]); 
                            }
                        }           
                    }catch(error) {
                    }
                } 
            }, 
            "statusCode": {
                403: function() { 
                    common.DisplayGlobalError("You are not authorized to perform this action.");
                },
                404: function() { 
                    common.DisplayGlobalError("Page not found");
                },
                500: function() {
                    common.DisplayGlobalError("Unknown error ocurred, please try again");
                }
            }
        }); 
    };
      
 
    /**
     * @license Pretty date by Copyright (c) 2011 John Resig (ejohn.org) MIT / GPL
     */
    /**
     * Takes an ISO time and returns a string representing how
     * long ago the date represents.
     *
     * @param {string|Date} time
     */
    common.FormatTimeAgo = function (time) {
        var date;
        dnFormat = time.match("([0-9]{13})");
        
        if(dnFormat[1] != "") {
            date = new Date();
            date.setTime(parseFloat(dnFormat[1]));
        } else {
            date = (typeof(time.getDate) == "undefined") ? new Date((time || "").replace(/-/g,"/").replace(/[TZ]/g," ")) : time;
        }
        var diff = (((new Date()).getTime() - date.getTime()) / 1000),
		    day_diff = Math.floor(diff / 86400);
		 
	    if ( isNaN(day_diff) || day_diff < 0 || day_diff >= 31 )
		    return;
		
	    return day_diff == 0 && (
			    diff < 60 && "just now" ||
			    diff < 120 && "1 minute ago" ||
			    diff < 3600 && Math.floor( diff / 60 ) + " minutes ago" ||
			    diff < 7200 && "1 hour ago" ||
			    diff < 86400 && Math.floor( diff / 3600 ) + " hours ago") ||
		    day_diff == 1 && "Yesterday" ||
		    day_diff < 7 && day_diff + " days ago" ||
		    day_diff < 31 && Math.ceil( day_diff / 7 ) + " weeks ago";
    };
    
    /**
     * Initializes the spinner/loader 

     * @return {Object}
     */
    common.InitializeLoader = function() { 
        
        var loading = $(".js-loading");
        loading.setLoaderText = common.SetLoaderText;

        return loading;
         
    };

    /**
     * Sets the loader text
     *
     * @param {string} text
     */
    common.SetLoaderText = function(text) {
        $(".js-loading-legend").html(text);
    };

})(jQuery, Parking);
