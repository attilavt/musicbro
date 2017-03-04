/**
 * Created by attila on 04.03.17.
 */

const apiKey = "49fcfbff9157101ca6a56e5c0fbf737b";

const baseUrl = "http://ws.audioscrobbler.com/2.0/";
const GET = "GET";

var debugMode = false;

var debug = function (msg) {
    if(debugMode)
        console.log(msg);
};

var request = require('request');
var querystring = require("querystring");
var youtubeClient = require('./youtube_client');

var sendRequest = function(path, method, callback) {
    console.log("- [REST] Sending " + method + " request to " + baseUrl + path + "...");
    if(method === GET) {
        request(baseUrl + path, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log("- [REST] Success sending " + method + " request to " + baseUrl + path);
                debug("- [REST] body: " + body);
                callback(JSON.parse(body));
            } else {
                var theResponse = response ? response.statusCode : null;
                console.log("- [REST] Error sending " + method + " request to " + baseUrl + path + " -> \nStatus: "+theResponse + ": \nError: " + error + "\nBody: " + body);
            }
        });
    }

};


/**
 * @param tag The tag
 * @param deepCallback (optional) function to carry out with the result of this method after the method
 * @return NULL. if you want to use the result, use it by providing a deepCallback
 */
var getTagTopArtists =function (tag, pageSize, pageNumber,deepCallback) {

    console.log("[LASTFM] Setting up tag top artists search for " + tag + " with page size " + pageSize + ", page number " + pageNumber);

    var query = querystring.stringify({method:"tag.getTopArtists", tag: tag, api_key: apiKey, format:"json", limit:pageSize, page:pageNumber});
    var leUrl =  "?"+query;

    var callback = function(chunk) {
        var list = chunk.topartists.artist;
        if (list.length === 0 ){
            console.log("No top artists found for genre with name "+ tag);
            return;
        }

        var result = [];

        for(var i= 0; i < list.length;i++) {
            result.push(list[i].name);
        }

        if(deepCallback)
            deepCallback(result);
    };

    return sendRequest(leUrl, GET, callback);
};


/**
 * @param name Name of the artist
 * @param deepCallback (optional) function to carry out with the result of this method after the method
 * @return NULL. if you want to use the result, use it by providing a deepCallback
 */
var getArtistTopTracks =function (name, limit, withYoutubeLink, deepCallback) {

    console.log("[LASTFM ATT] Setting up artist top tracks search for " + name);

    var query = querystring.stringify({method:"artist.getTopTracks", artist: name, api_key: apiKey, format:"json", limit:limit});
    var leUrl =  "?"+query;

    var callback = function(chunk) {
        var list = chunk.toptracks.track;
        if (list.length === 0 ){
            console.log("No top tracks found for artist with name "+ name);
            return;
        }

        var result = [];

        var youtubeLinkRequested =0;
        var youtubeLinkReceived = 0;

        var registerYoutubeLink = function(video) {
            youtubeLinkReceived++;
            debug("[LASTFM ATT] Registering video " + video + " " + video.url+ " " + youtubeLinkReceived + "/"+ youtubeLinkRequested);
            result.push(video);
            if(youtubeLinkReceived== youtubeLinkRequested) {
                debug("[LASTFM ATT] Delivering " + result);
                deepCallback(result);
            }
        };

        for(var i= 0; i < list.length;i++) {
            var track = list[i].name;
            debug("Item " + track);
            if(!withYoutubeLink) {
                result.push({artist:name, name:track.name});
            } else {
                youtubeLinkRequested++;
                youtubeClient.getVideoLink(name, track, registerYoutubeLink);
            }
        }

        if(!withYoutubeLink && deepCallback)
            deepCallback(result);
    };

    return sendRequest(leUrl, GET, callback);
};

module.exports = {
    getTagTopArtists: getTagTopArtists,
    getArtistTopTracks: getArtistTopTracks
};