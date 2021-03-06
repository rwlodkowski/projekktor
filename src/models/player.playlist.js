/*
 * this file is part of:
 * projekktor zwei
 * http://filenew.org/projekktor/
 *
 * Copyright 2010, 2011, Sascha Kluger, Spinning Airwhale Media, http://www.spinningairwhale.com
 * under GNU General Public License
 * http://www.filenew.org/projekktor/license/
*/
(function(window, document, $, $p){
    
    "use strict";

$p.newModel({

    modelId: 'PLAYLIST',
    browserVersion: '1.0',
    iLove: [
        {ext:'json', type:'text/json', platform: ['browser']},
        {ext:'xml', type:'text/xml', platform: ['browser']},
        {ext:'json', type:'application/json', platform: ['browser']},
        {ext:'xml', type:'application/xml', platform: ['browser']}
    ],

    applyMedia: function(destContainer) {
        this.displayReady();
    },

    setPlay: function() {
        this.sendUpdate('playlist', this.media);
    }
});

}(window, document, jQuery, projekktor));
