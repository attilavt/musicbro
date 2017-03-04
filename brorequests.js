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
 * @param list The string list to search through
 * @param string The string to search for
 * @returns {boolean} whether given string is contained in given list
 */
var listContains = function (list, string) {
    for(var i = 0; i < list.length;i++) {
        if(list[i]===string) {
            return true;
        }
    }
    return false;
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
            if(!listContains(knownLikes,artist)) {
                debug("Artist " + artist + " not in list of known likes: " + knownLikes);
                j++;
                startArtist(artist);
                if(j>=limit) {
                    break;
                }
            } else {
                debug("Artist " + artist + " IS in list of known likes: " + knownLikes);
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