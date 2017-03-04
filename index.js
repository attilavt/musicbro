var VERIFY_TOKEN = 'test5050';
var PAGE_ACCESS_TOKEN = 'EAAQl84kLMuABAFDrmEogZCZAD9dGwzsOww7OYaBeabwqmZBghuT0LE4ZAyyfAJMwPKYRZCzfWMpyQoqBOBx5vPIFfmRXVJA7hZCWRBH1Dy6SB2TVVzHyL4gz5raXnKgeOBWj4wIctHs48rTwrGqiFPdC2BJZBCveBuQ0wYXH7qjWwZDZD';
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var request = require('request');
var spotifyClient = require('./spotify_client');
var lastfmClient = require('./lastfm_client');
var youtubeClient = require('./youtube_client');
var brorequests = require('./brorequests');

//spotifyClient.getArtistId("AFI");
//spotifyClient.getArtistTopTracks("Attila von Thermann",undefined, 3);
//spotifyClient.getSimilarArtists("AFI",undefined,3);
//lastfmClient.getTagTopArtists("indie",3);

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

/*

brorequests.getSuggestions([],"cloud rap",3, printTracks);
 lastfmClient.getArtistTopTracks("Kafkas Orient Bazaar", 3,true,printTracks);
*/
//youtubeClient.getVideoLink("Kafkas Orient Bazaar Hair Grip", printObjects);

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.send('Hello world');
});

app.get('/suggestions', function (req, res) {
    var klString = req.headers["mb-known-likes"];
    var genre = req.headers["mb-genre"];
    console.log("[SUGG][INPUT] Known likes raw header:" + klString);
    console.log("[SUGG][INPUT] Genre: " + genre);
    if(!klString || ! genre) {
        var error = "Error! Required Headers not set! mb-known-likes:"+ klString + "; genre:" + genre;
        console.log("[SUGG][INPUT][ERROR]: " + error);
        res.send(error);
        return;
    }
    var knownLikes = klString.split(",,,");
    console.log("[SUGG][INPUT] Known likes split: "+knownLikes);
    var outputAsJson = function (list) {
        res.send(JSON.stringify(list));
    };
    brorequests.getSuggestions(knownLikes,genre,3, outputAsJson);
});

app.get('/likes', function (req, res) {
  res.sendfile('likelist.html', {root: __dirname })
});

// set the port of our application
// process.env.PORT lets the port be set by Heroku
var port = process.env.PORT || 8080;


app.listen(port, function () {
  console.log('Listening on port' + port);
});

// respond to facebook's verification
app.get('/webhook', function(req, res) {
  if (req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] === VERIFY_TOKEN) {
    console.log("Validating webhook");
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);          
  }  
});

// respond to post calls from facebook
app.post('/webhook/', function (req, res) {
  var data = req.body;

  // Make sure this is a page subscription
  if (data.object === 'page') {

    // Iterate over each entry - there may be multiple if batched
    data.entry.forEach(function(entry) {
      var pageID = entry.id;
      var timeOfEvent = entry.time;

      // Iterate over each messaging event
      entry.messaging.forEach(function(event) {
        if (event.message) {
          receivedMessage(event);
        } 
         else if (event.postback) {
          receivedPostback(event);  
        }


        else {
          console.log("Webhook received unknown event: ", event);
        }
      });
    });

    // Assume all went well.
    //
    // You must send back a 200, within 20 seconds, to let us know
    // you've successfully received the callback. Otherwise, the request
    // will time out and we will keep trying to resend.
    res.sendStatus(200);
  }
});

function receivedMessage(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

  console.log("Received message for user %d and page %d at %d with message:", 
              senderID, recipientID, timeOfMessage);
              console.log(JSON.stringify(message));

              var messageId = message.mid;

              var messageText = message.text;
              var messageAttachments = message.attachments;

              if (messageText) {

                // If we receive a text message, check to see if it matches a keyword
                // and send back the example. Otherwise, just echo the text we received.
                switch (messageText) {
                  case 'generic':
                    sendGenericMessage(senderID);
                    break;

                  default:
                    sendTextMessage(senderID, messageText);
                }
              } else if (messageAttachments) {
                sendTextMessage(senderID, "Message with attachment received");
              }
}
function sendTextMessage(recipientId, messageText) {
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





function sendGenericMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [{
            title: "rift",
            subtitle: "Next-generation virtual reality",
            item_url: "https://www.oculus.com/en-us/rift/",               
            image_url: "http://messengerdemo.parseapp.com/img/rift.png",
            buttons: [{
              type: "web_url",
              url: "https://www.oculus.com/en-us/rift/",
              title: "Open Web URL"
            }, {
              type: "postback",
              title: "Call Postback",
              payload: "Payload for first bubble",
            }],
          }, {
            title: "touch",
            subtitle: "Your Hands, Now in VR",
            item_url: "https://www.oculus.com/en-us/touch/",               
            image_url: "http://messengerdemo.parseapp.com/img/touch.png",
            buttons: [{
              type: "web_url",
              url: "https://www.oculus.com/en-us/touch/",
              title: "Open Web URL"
            }, {
              type: "postback",
              title: "Call Postback",
              payload: "Payload for second bubble",
            }]
          }]
        }
      }
    }
  };  

  callSendAPI(messageData);
}




function receivedPostback(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfPostback = event.timestamp;

  // The 'payload' param is a developer-defined field which is set in a postback 
  // button for Structured Messages. 
  var payload = event.postback.payload;

  console.log("Received postback for user %d and page %d with payload '%s' " + 
    "at %d", senderID, recipientID, payload, timeOfPostback);

  // When a postback is called, we'll send a message back to the sender to 
  // let them know it was successful
  sendTextMessage(senderID, "Postback called");
}







function callSendAPI(messageData) {
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
}



