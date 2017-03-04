/**
 * Created by attila on 04.03.17.
 */

//var spotifyClient = require('./spotify_client');
//var lastfmClient = require('./lastfm_client');
//var youtubeClient = require('./youtube_client');

//spotifyClient.getArtistId("AFI");
//spotifyClient.getArtistTopTracks("Attila von Thermann",undefined, 3);
//spotifyClient.getSimilarArtists("AFI",undefined,3);
//lastfmClient.getTagTopArtists("indie",3);

/*
 var printTracks = function(tracks) {
 console.log("Printing Tracks: ");
 for(var i = 0; i < tracks.length;i++) {
 var track = tracks[i];
 console.log("Track: '" + track.name + "' by " + track.artist + " (" + track.url + ")");
 }
 };
 var printObjects = function(tracks) {
 for(var i = 0; i < tracks.length;i++) {
 var track = tracks[i];
 console.log("Object: " + track);
 }
 };



 brorequests.getSuggestions([],"cloud rap",3, printTracks);
 lastfmClient.getArtistTopTracks("Kafkas Orient Bazaar", 3,true,printTracks);
 */
//youtubeClient.getVideoLink("Kafkas Orient Bazaar Hair Grip", printObjects);


/*
 function sendTextMessage(recipientId, messageText) {
 request({
 uri: 'https://graph.facebook.com/v2.6/me/music',
 qs: { access_token: PAGE_ACCESS_TOKEN },
 method: 'POST'

 }, function (error, response, body) {
 if (!error) {

 //for (var l = response.data.length, i = 0; i < l; i++) {
 var obj = response.data[1];
 //console.log(obj.name);
 var messageTest = obj.name;

 //var recipientId = body.recipient_id;
 //var messageId = body.message_id;


 console.log("Successfully name music");
 } else {
 console.error("Unable to send message.");
 console.error(response);
 console.error(error);
 }
 });
 var messageData = {
 recipient: {
 id: recipientId
 },
 message: {
 text: messageText
 }
 };

 callSendAPI(messageData);
 }
 */


/*

 function testLikeMusic(messageData) {
 request({
 uri: 'https://graph.facebook.com/v2.6/me/messages',
 qs: { access_token: PAGE_ACCESS_TOKEN },
 method: 'POST',
 json: messageData

 }, function (error, response, body) {
 if (!error && response.statusCode == 200) {
 var recipientId = body.recipient_id;
 var messageId = body.message_id;

 console.log("Successfully sent generic message with id %s to recipient %s",
 messageId, recipientId);
 } else {
 console.error("Unable to send message.");
 console.error(response);
 console.error(error);
 }
 });
 }*/


/* make the API call
 FB.api(
 "/me/music?fields",
 function (response) {
 if (response && !response.error) {
 var artistNameList = [];

 for (var l = response.data.length, i = 0; i < l; i++) {
 var obj = response.data[i];
 //console.log(obj.name);
 // append new value to the array
 artistNameList.push(obj.name);

 }
 brorequests.getSuggestions(artistNameList,"cloud rap",3, printTracks);

 }
 }
 );
 */

/*
 YOUTUBE LINKS NOT WORKING
 function testSendVideo(recipientId) {
 var messageData = {
 recipient: {
 id: recipientId
 },
 message:{
 attachment:{
 type:"video",
 payload:{
 url:"https://www.youtube.com/watch?v=3NPxqXMZq7o"
 }
 }
 }
 };

 callSendAPI(messageData);
 }

 */