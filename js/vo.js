
define([ "jquery" ], function( $ ) {

    "use strict";

    /*
    *
    * `this.cur` and `this.new` data structure
    *
    * when version = undefined ( 1 )
    * property `url` `date` `name` `info`
    * url != hdurl when bing.com
    * `date` is `enddate`
    *
    * when version = 2
    * add new property `hdurl` `enddate` `shortname` `version` `type`
    * change `data` to `endate`
    *
    * type include: `default` `today` `bing.com` `wallhaven.cc` `unsplash.it` `unsplash.com` `flickr.com` `googleart.com` `500px.com` `desktoppr.co` `visualhunt.com` `nasa.gov` `special` `holiday` `upload`
    *
    * when version = 2.1
    * add new property `favorite`
    *
    * when version = 2.2
    * add new property `apis_vo` `uid`( url )
    *
    */
    var VERSION = "2.2";

    function VO() {
        this.cur = {};  //current background data structure
        this.new = {};  //new background data structure
    }

    VO.DEFAULT_BACKGROUND = "../assets/images/background.jpg";
    VO.CURRENT_BACKGROUND = "filesystem:" + chrome.extension.getURL( "/" ) + "temporary/background.jpg";
    VO.BACKGROUND         = "background.jpg";

    VO.prototype.Create = function( url, hdurl, name, info, enddate, shortname, type, apis_vo, favorite ) {

            Object.defineProperty( this.new, "hdurl", {
                enumerable  : true,
                configurable: true,
                set: function( value ) {
                    var re  = /^https?:\/\/(w{3}\.)?(\w+\.)+([a-zA-Z]{2,})(:\d{1,4})?\/?($)?|filesystem:/ig;
                    var cdn = "http://res.cloudinary.com/simptab/image/fetch/f_webp/";                            // 137-simptab-add-cloudinary-cdn-fech-test
                    cdn     = [ "unsplash.it", "special", "holiday", "today", "upload" ].indexOf( type ) != -1  ? "" : cdn; // 137-simptab-add-cloudinary-cdn-fech-test
                    hdurl   = re.test( value ) ? cdn + value : VO.DEFAULT_BACKGROUND;
                },
                get: function() { return hdurl; }
            });

            this.new.url       = url;
            this.new.hdurl     = hdurl;
            this.new.name      = name;
            this.new.info      = info;
            this.new.enddate   = enddate;
            this.new.shortname = shortname;
            this.new.type      = type;
            this.new.apis_vo   = apis_vo;
            this.new.version   = VERSION;
            this.new.favorite  = favorite == undefined ? -1 : favorite;
            this.new.uid       = btoa( url );

            return this.new;
    };

    VO.prototype.Set = function( result ) {
            chrome.storage.local.set( { "simptab-background" : result });
    };

    VO.prototype.Get = function ( callBack ) {
            return chrome.storage.local.get( "simptab-background", callBack );
    };

    VO.prototype.Verify = function() {
        var result = false;
        switch ( this.cur.version ) {
            case "2":
                this.cur.favorite = -1;
                this.cur.version  = VERSION;
            case "2.1":
                if ( this.cur.type == "googleartproject.com" ) this.cur.type = "googleart.com";
                if ( this.cur.enddate.length == 8 && this.cur.type == "bing.com" ) this.cur.type = "today";
                this.cur.apis_vo  = {};
                this.cur.uid      = btoa( this.cur.url );
                this.cur.version  = VERSION;
            case VERSION:
                result            = true;
                break;
        }
        return result;
    };

    VO.prototype.Clone = function( value ) {
        return $.extend( {}, value );
    };

    return new VO();

});
