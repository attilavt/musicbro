/**
 * Created by attila on 04.03.17.
 */

const baseUrl = "https://www.googleapis.com/youtube/v3/search";
const GET = "GET";
const apiKey="AIzaSyCNJjCCQVanKUek5GjNImfu-RIHDa6Eyr0";
const targetPrefix = "https://youtu.be/";

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
                console.log("- [REST] Success sending " + method + " request to " + baseUrl + path);
                callback(JSON.parse(body));
            } else {
                var theResponse = response ? response.statusCode : null;
                console.log("- [REST] Error sending " + method + " request to " + baseUrl + path + " -> \nStatus: "+theResponse + ": \nError: " + error + "\nBody: " + body);
            }
        });
    }

};


/**
 * @param artist Artist of the track
 * @param track The track's name
 * @param deepCallback (optional) function to carry out with the result of this method after the method
 * @return NULL. if you want to use the result, use it by providing a deepCallback
 */
var getVideoLink =function (artist, track, deepCallback) {

    var name = artist + " " + track;

    console.log("[YOUTUBE] Setting up video search for " + name);

    var query = querystring.stringify({part:"snippet",type:"video", q: name, key:apiKey});
    var leUrl =  "?"+query;

    var callback = function(chunk) {
        var list = chunk.items;
        if (list.length === 0 ){
            console.log("No videos for name "+ name);
            return;
        }

        var result = {artist:artist, name:track,url:targetPrefix+list[0].id.videoId};

        debug("[YOUTUBE] Found result " + result.artist +", " + result.name + ", " + result.url);

        if(deepCallback)
            deepCallback(result);
    };

    return sendRequest(leUrl, GET, callback);
};


module.exports = {
    getVideoLink: getVideoLink
};