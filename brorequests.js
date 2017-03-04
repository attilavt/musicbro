/**
 * Created by attila on 04.03.17.
 */

var spotifyClient = require('./spotify_client');
var lastfmClient = require('./lastfm_client');
var debugMode = false;

var debug = function (msg) {
    if(debugMode)
        console.log(msg);
};

/**
 *
 * Return data: objects with {artist, name, url}
 *
 * @param knownLikes List with names of artists that we know the user likes
 * @param genre the genre for which the suggestions should be
 * @param limit how many suggestions
 */
var getSuggestions = function(knownLikes, genre, limit, deepCallback) {

    // step 2: enrich artists with top track
    var enrichArtists = function (list) {

        var result = [];
        var startedArtists = 0;
        var finishedArtists = 0;
        var itsFinished = function(artists) {
            debug("FINISHED " + artists[0].artist);
            result = result.concat(artists);
            finishedArtists++;
            if(startedArtists<=finishedArtists) {
                debug("FINISHED TOTALLY");
                if(deepCallback) {
                    deepCallback(result);
                }

            }
        };
        var startArtist = function(artist) {
            startedArtists++;
            debug("STARTING " + artist);
            spotifyClient.getArtistTopTracks(artist,null,1,itsFinished);
        };
        var j = 0;
        for(var i = 0; i < list.length;i++) {
            var artist = list[i];
            if(!knownLikes.indexOf(artist) > -1) {
                j++;
                startArtist(artist);
                if(j>=limit) {
                    break;
                }
            }
        }

    };

    // step 1: get top artists for genre, filter out known likes
    var factor = 10;
    lastfmClient.getTagTopArtists(genre, limit*factor, enrichArtists);
};

module.exports = {
    getSuggestions: getSuggestions
};