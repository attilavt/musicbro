/**
 * Created by attila on 04.03.17.
 */

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
        if(list[i].toUpperCase()===string.toUpperCase()) {
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
 * @param amount how many suggestions
 */
var getSuggestions = function(knownLikes, genre, amount, deepCallback) {

    // step 2: enrich artists with top track
    var getTracksForArtists = function (list) {

        var result = [];
        var artistsWithEnrichmentStarted = 0;
        var artistsWithEnrichmentFinished = 0;
        var registerTracksForArtist = function(tracks) {
            if(!tracks || !tracks[0]) {
                debug("Tracks was empty!");
                return;
            }
            result = result.concat(tracks);
            artistsWithEnrichmentFinished++;
            var artist = tracks && tracks[0] ? tracks[0].artist : "-";
            debug("FINISHED TRACKS OF ARTIST "+ artist + " , " +artistsWithEnrichmentFinished);
            if(artistsWithEnrichmentStarted==artistsWithEnrichmentFinished) {
                debug("FINISHED TRACKS TOTALLY " + artistsWithEnrichmentFinished + "/" +artistsWithEnrichmentStarted);
                if(deepCallback) {
                    debug("BR DELIVERING " + artistsWithEnrichmentFinished + "/" +artistsWithEnrichmentStarted);
                    deepCallback(result);
                } else {
                    debug("BR NOT DELIVERING " + artistsWithEnrichmentFinished + "/" +artistsWithEnrichmentStarted);
                }

            }
        };
        var getTracksForArtist = function(artist) {
            artistsWithEnrichmentStarted++;
            debug("STARTING TRACKS OF " + artist + " " + artistsWithEnrichmentStarted);
            lastfmClient.getArtistTopTracks(artist,1,true,registerTracksForArtist);
        };
        var j = 0;
        for(var i = 0; i < list.length;i++) {
            var artist = list[i];
            if(!listContains(knownLikes,artist)) {
                debug("Artist " + artist + " not in list of known likes: " + knownLikes);
                j++;
                getTracksForArtist(artist);
                if(j>=amount) {
                    break;
                }
            } else {
                debug("Artist " + artist + " IS in list of known likes: " + knownLikes);
            }
        }

    };

    // step 1: get top artists for genre, filter out known likes; query more artists than we need, since some might be
    // already known to the user
    var factorMin = 2.0;
    var factorMax = 4.0;
    var minPageNumber = 12;
    var maxPageNumber = 24;
    var pageSize = Math.round(amount * factorMin + (amount *(factorMax-factorMin)*Math.random()));
    var pageNumber = minPageNumber+Math.round(Math.random() *maxPageNumber-minPageNumber);
    lastfmClient.getTagTopArtists(genre, pageSize, pageNumber, getTracksForArtists);
};

module.exports = {
    getSuggestions: getSuggestions,
    listContains:listContains
};