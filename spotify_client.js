/**
 * Created by attila on 04.03.17.
 */

const baseUrl = "https://api.spotify.com/v1/";
const market = "DE";
const GET = "GET";

var request = require('request');
var querystring = require("querystring");

var debugMode = false;

var debug = function (msg) {
    if(debugMode)
        console.log(msg);
};

var sendRequest = function(path, method, callback) {
    console.log("- [REST] Sending " + method + " request to " + baseUrl + path + "...");
    if(method === GET) {
        request(baseUrl + path, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log("- [REST] Successs sending " + method + " request to " + baseUrl + path);
                callback(JSON.parse(body));
            } else {
                console.log("- [REST] Error sending " + method + " request to " + baseUrl + path + " -> \nStatus: "+response.statusCode + ": \nError: " + error + "\nBody: " + body);
            }
        });
    }

};

/**
 * @param name Name of the artist
 * @param deepCallback (optional) function to carry out with the result of this method after the method
 * @return NULL. if you want to use the result, use it by providing a deepCallback
 */
var getArtistId =function (name, deepCallback) {

    console.log("[SPOTIFY] Setting up artist ID search for " + name);

    var query = querystring.stringify({q:name,type:"artist",market:market,limit:1});
    var leUrl =  "search?" + query;

    var callback = function(chunk) {
        if (chunk.artists.items.length === 0 ){
            console.log("No spotify id found for artist with name"+ name);
            return;
        }

        var result = chunk.artists.items[0].id;

        debug("Found spotify id ", result, "for artist with name "+ name);
        if(deepCallback)
            deepCallback(result);
        return result;
    };

    return sendRequest(leUrl, GET, callback);
};

/**
 * @param name Name of the artist
 * @param artistSpotifyId (optional) spotify ID of the artist. if not given, getArtistId method is used before sending the request for this method
 * @param limit amount of similar artists wanted
 * @param deepCallback (optional) function to carry out with the result of this method after the method
 * @return NULL. if you want to use the result, use it by providing a deepCallback
 */
var getSimilarArtists = function (name, artistSpotifyId, limit, deepCallback) {
    var doIt = function (spotifyId) {
        console.log("[SPOTIFY] Setting up similar artists search for " + name);
        var leUrl =  "artists/" + spotifyId + "/related-artists?country=" + market;

        var callback = function(chunk) {
            if (chunk.artists.length === 0 ){
                console.log("No spotify similar artist found for artist with name"+ name);
                return;
            }

            var result = [];

            for(var i = 0; i < chunk.artists.length && i < limit; i++) {
                var artist = chunk.artists[i];
                result.push(artist.name);
            }

            debug("Found spotify similar artists ", result, "for artist with name "+ name);
            if(deepCallback)
                deepCallback(result);
            return result;
        };

        return sendRequest(leUrl, GET, callback);
    };

    if(!artistSpotifyId) {
        getArtistId(name, doIt);
    } else {
        doIt(artistSpotifyId);
    }

};

/**
 * Result is list of object with (name, url)
 * @param name Name of the artist
 * @param artistSpotifyId (optional) spotify ID of the artist. if not given, getArtistId method is used before sending the request for this method
 * @param limit amount of top tracks wanted
 * @param deepCallback (optional) function to carry out with the result of this method after the method
 * @return NULL. if you want to use the result, use it by providing a deepCallback
 */
var getArtistTopTracks = function (name, artistSpotifyId, limit, deepCallback) {

    var doIt = function (spotifyId) {
        console.log("[SPOTIFY] Setting up artist top tracks search for " + name);
        var leUrl =  "artists/" + spotifyId + "/top-tracks?country=" + market;

        var callback = function(chunk) {
            if (chunk.tracks.length === 0 ){
                console.log("No spotify top tracks found for artist with name"+ name);
                return;
            }

            var result = [];

            for(var i = 0; i < chunk.tracks.length && i < limit; i++) {
                var track = chunk.tracks[i];
                var artistName = "";
                var sep = ", ";
                for(var j = 0; j < track.artists.length; j++) {
                    artistName+=track.artists[j].name +sep;
                }
                artistName = artistName.substring(0, artistName.length-sep.length);
                result.push({artist:artistName,name:track.name, url:track.external_urls.spotify});
            }

            debug("Found spotify top tracks ", result, "for artist with name "+ name);
            if(deepCallback)
                deepCallback(result);
            return result;
        };

        return sendRequest(leUrl, GET, callback);
    };

    if(!artistSpotifyId) {
        getArtistId(name, doIt);
    } else {
        doIt(artistSpotifyId);
    }

};



/**
 * Spotify does not really give a response if no query string is provided....

 var querystring = require("querystring");
 * Result is list of object with (name, url)
 * @param genre Name of the genre
 * @param limit amount of top tracks wanted
 * @param deepCallback (optional) function to carry out with the result of this method after the method
 * @return NULL. if you want to use the result, use it by providing a deepCallback

var getGenreTopTracks = function (leGenre, limit, deepCallback) {

    var doIt = function () {
        var escGenre = querystring.stringify({genre:"\""+leGenre+"\"", country:market, q:"*", type:"track", limit:limit});
        var leUrl =  "search?"+escGenre;

        var callback = function(chunk) {
            console.log("Found genre top tracks ", chunk, "for genre with name "+ leGenre);
            if (chunk.tracks.length === 0 ){
                console.log("No spotify top tracks found for artist with name"+ leGenre);
                return;
            }

            var result = [];

            for(var i = 0; i < chunk.tracks.length && i < limit; i++) {
                var track = chunk.tracks[i];
                result.push({name:track.name, url:track.external_urls.spotify});
            }

            console.log("Found spotify top tracks ", result, "for artist with name "+ leGenre);
            if(deepCallback)
                deepCallback(result);
            return result;
        };

        return sendRequest(leUrl, GET, callback);
    };

     doIt();

};
 */

module.exports = {
    getArtistId: getArtistId,
    getSimilarArtists: getSimilarArtists,
    getArtistTopTracks: getArtistTopTracks
};