/*
 * this file is part of:
 * projekktor player
 * http://www.projekktor.com
 *
 * Copyright 2014-2015 - Radosław Włodkowski, www.wlodkowski.net, radoslaw@wlodkowski.net
 * 
 * under GNU General Public License
 * http://www.filenew.org/projekktor/license/
 * 
 * This model is interfacing mediaplayer.js Silverlight fallback player
 *
 * MediaElement.js
 * Author: John Dyer http://j.hn/
 * Website: http://mediaelementjs.com/
 * License: MIT
 * 
 */
        
jQuery(function($) {
$p.newModel({

    modelId: 'SILVERLIGHTVIDEO',
    
    silverlightVersion: '3.0.0',
    
    platform: 'silverlight',
    //minPlatformVersion: "3.0",
    
    iLove: [
        {ext:'wmv', type:'video/wmv', platform:'silverlight', streamType: ['*']},
        {ext:'wmv', type:'video/x-ms-wmv', platform:'silverlight', streamType: ['*']},
        {ext:'mp4', type:'video/mp4', platform:'silverlight', streamType: ['*']},
        {ext:'mp4', type:'video/m4v', platform:'silverlight', streamType: ['*']},
        {ext:'mov', type:'video/mov', platform:'silverlight', streamType: ['*']},
        {ext:'mov', type:'video/quicktime', platform:'silverlight', streamType: ['*']},
        {ext:'m4v', type:'video/mp4', platform:'silverlight', streamType: ['*']}
    ],
    
    allowRandomSeek: false,
    _silverlightApi: {},

    _eventMap: {
        paused:         "pauseListener",
        play:           "playingListener",
        volumechange:   "volumeListener",
        progress:       "_progress",
        timeupdate:     "timeListener",
        ended:          "endedListener",
        waiting:        "waitingListener",
        canplaythrough: "canplayListener",
        canplay:        "canplayListener",
        error:          "errorListener",
        suspend:        "suspendListener",
        seeked:         "seekedListener",
        loadedmetadata: "metaDataListener",
        
        // events to ignore
        playing: "nullListener",
        loadstart: "nullListener",
        loadeddata: "nullListener",
        seeking: "nullListener",
        click: "nullListener"
    },    
    
    applyMedia: function(destContainer) {
        var ref = this,
            ppId = ref.pp.getId(),
            ppMediaId = ref.pp.getMediaId();
        
        // register global listener
        window['projekktorSilverlightReady' + ppId] = function(id) {
            projekktor(ppId).playerModel.silverlightReadyListener(id);
        };
        
        window['projekktorSilverlightEventListener' + ppId] = function(id, eventName, values)  {
            projekktor(ppId).playerModel.silverlightEventListener(id, eventName, values);
        };

        destContainer
            .html('')
            .css({
                'width': '100%',
                'height': '100%',
                'position': 'absolute',
                'top': 0,
                'left': 0
            });
        
        var config = {
            src: this.pp.getConfig('platformsConfig').silverlight.src,
            attributes: {
                id: ppMediaId + "_silverlight",
                name: ppMediaId + "_silverlight",
                width: '100%',
                height: '100%',
                style: "position: absolute;"
            },
            parameters: {
                windowless: true,
                background: "black", 
                minRuntimeVersion: "3.0.0.0",
                autoUpgrade: true
            },
            initVars: $.extend({
                id: ppId,
                isvideo: true,
                autoplay: false, 
                preload: "none",
                startvolume: this._volume,
                timerrate: 250,
                jsinitfunction: 'window.projekktorSilverlightReady' + ppId,
                jscallbackfunction: 'window.projekktorSilverlightEventListener' + ppId
            }, this.pp.getConfig('platformsConfig').silverlight.initVars || {})
        };
        
        this.mediaElement = $p.utils.embedPlugin(this.platform, destContainer, config, true);
    },
        
    applySrc: function() {
        var ref = this,
            sources = this.getSource();
        
        try {
            this._silverlightApi.setSrc(sources[0].src);
        }
        catch(e){}
        
        if (this.getState('PLAYING')) {
            this.setPlay();
            if (ref.isPseudoStream!==true && this.media.position>0) {
                this.setSeek(this.media.position);
            }
        }
        
        return true;
    }, 

    detachMedia: function() {
        try {
            this.mediaElement[0].remove();
        } 
        catch(e){}           
    },
    
    /*****************************************
     * Handle Events
     ****************************************/ 
    
    addListeners: function() {}, 
    
    removeListeners: function() {},
    
    loadProgressUpdate: function () {},
    
    silverlightReadyListener: function(mediaId) {
        if(!this.mediaElement){
            this.mediaElement = $('#' +  mediaId); // IE 10 sucks
        }
        
        if (this.mediaElement !== null && (this.getState('AWAKENING') || this.getState('STARTING'))) {
            this._silverlightApi = this.mediaElement[0].Content.MediaElementJS;
            this.applySrc();
            this.displayReady();
        }
    },
    
    silverlightEventListener: function(id, eventName, values) {
        try {
            this[this._eventMap[eventName]](values);
        }
        catch(e){
            console.log(e, eventName);
        }
    },
    
    errorListener: function() {
    },
    
    _progress: function(event) {
        this.progressListener({loaded:event.bufferedTime, total:event.duration});
    },
    
    /************************************************
     * setters
     ************************************************/
    
    setSeek: function(newpos) {
        this._silverlightApi.setCurrentTime(newpos);
    },
    
    setVolume: function(newvol) {
        if (this.mediaElement === null) {
            this.volumeListener(newvol);
        }
        else {
            this._silverlightApi.setVolume(newvol);
        }
    },
    
    setPause: function() {
        this._silverlightApi.pauseMedia();
    },
    
    setPlay: function() {
        this._silverlightApi.playMedia();
    },
    
    setQuality: function (quality) {
        if (this._quality === quality) {
            return;
        }
        
        this._quality = quality;

        this._qualitySwitching = true;
        this.applySrc();
        this._qualitySwitching = false;
        this.qualityChangeListener();
    }

    /************************************************
     * getters
     ************************************************/
});

$p.newModel({    

    modelId: 'SILVERLIGHTAUDIO',
    
    hasGUI: false,
    iLove: [
        {ext:'mp3', type:'audio/mp3', platform:'silverlight', streamType: ['*']},
        {ext:'m4a', type:'audio/mp4', platform:'silverlight', streamType: ['*']},
        {ext:'m4a', type:'audio/mpeg', platform:'silverlight', streamType: ['*']},
        {ext:'wma', type:'audio/wma', platform: 'silverlight', streamType: ['*']},
        {ext:'wma', type:'audio/x-ms-wma', platform: 'silverlight', streamType: ['*']},
        {ext:'wav', type:'audio/wav', platform: 'flash', streamType: ['*']}
    ],
    applyMedia: function(destContainer) {
        var ref = this,
            ppId = ref.pp.getId(),
            ppMediaId = ref.pp.getMediaId();
        
        $p.utils.blockSelection(destContainer);
        
        // create image element
        this.imageElement = this.applyImage(this.getPoster('cover') || this.getPoster('poster'), destContainer);
        
        // register global listener
        window['projekktorSilverlightReady' + ppId] = function(id) {
            projekktor(ppId).playerModel.silverlightReadyListener(id);
        };
        
        window['projekktorSilverlightEventListener' + ppId] = function(id, eventName, values)  {
            projekktor(ppId).playerModel.silverlightEventListener(id, eventName, values);
        };
        
        var config = {
            src: this.pp.getConfig('platformsConfig').silverlight.src,
            attributes: {
                id: ppMediaId + "_silverlight",
                name: ppMediaId + "_silverlight",
                width: '100%',
                height: '100%',
                style: "position: absolute;"
            },
            parameters: {
                windowless: true,
                background: "black", 
                minRuntimeVersion: "3.0.0.0",
                autoUpgrade: true
            },
            initVars: $.extend({
                id: ppId,
                isvideo: true,
                autoplay: false, 
                preload: "none",
                startvolume: this._volume,
                timerrate: 250,
                jsinitfunction: 'window.projekktorSilverlightReady' + ppId,
                jscallbackfunction: 'window.projekktorSilverlightEventListener' + ppId
            }, this.pp.getConfig('platformsConfig').silverlight.initVars || {})
        };
        
        this.mediaElement = $p.utils.embedPlugin(this.platform, destContainer, config, true);
    }
    
}, 'SILVERLIGHTVIDEO');
});