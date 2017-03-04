/**
 * Created by attila on 04.03.17.
 */

const spotifyBaseUrl = "https://api.spotify.com/v1/";
const market = "DE";
const GET = "GET";

var request = require('request');

var sendRequest = function(path, method, callback) {
    console.log("Sending " + method + " request to " + spotifyBaseUrl + path + "...");
    if(method === GET) {
        request(spotifyBaseUrl + path, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log("response.statusCode:" +response.statusCode);
                callback(JSON.parse(body));
            }
            return;
        });
    }

};

var getArtistId =function (name, deepCallback) {
    var leUrl =  "search?q=" + name + "&type=artist&market=" + market + "&limit=1";

    var callback = function(chunk) {
        if (chunk.artists.items.length === 0 ){
            console.log("No spotify id found for artist with name"+ name);
            return;
        }

        var result = chunk.artists.items[0].id;

        console.log("Found spotify id ", result, "for artist with name "+ name);
        if(deepCallback)
            deepCallback(result);
        return result;
    };

    return sendRequest(leUrl, GET, callback);
};

var getSimilarArtists = function (name, artistSpotifyId, limit, deepCallback) {

    var leUrl =  "artists/" + artistSpotifyId + "/related-artists?country=" + market;

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

        console.log("Found spotify similar artists ", result, "for artist with name "+ name);
        if(deepCallback)
            deepCallback(result);
        return result;
    };

    return sendRequest(leUrl, GET, callback);
};

module.exports = {
    getArtistId: getArtistId,
    getSimilarArtists: getSimilarArtists
};