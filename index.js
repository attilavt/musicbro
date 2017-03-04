var VERIFY_TOKEN = 'test5050';
var PAGE_ACCESS_TOKEN = 'EAAQl84kLMuABAFDrmEogZCZAD9dGwzsOww7OYaBeabwqmZBghuT0LE4ZAyyfAJMwPKYRZCzfWMpyQoqBOBx5vPIFfmRXVJA7hZCWRBH1Dy6SB2TVVzHyL4gz5raXnKgeOBWj4wIctHs48rTwrGqiFPdC2BJZBCveBuQ0wYXH7qjWwZDZD';
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var request = require('request');
var spotifyClient = require('./spotify_client');
var lastfmClient = require('./lastfm_client');
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
brorequests.getSuggestions([],"cloud rap",3, printTracks);

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.send('Hello world');
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
        } else {
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
