var VERIFY_TOKEN = 'test5050';
var PAGE_ACCESS_TOKEN = 'EAAQl84kLMuABAFDrmEogZCZAD9dGwzsOww7OYaBeabwqmZBghuT0LE4ZAyyfAJMwPKYRZCzfWMpyQoqBOBx5vPIFfmRXVJA7hZCWRBH1Dy6SB2TVVzHyL4gz5raXnKgeOBWj4wIctHs48rTwrGqiFPdC2BJZBCveBuQ0wYXH7qjWwZDZD';
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var request = require('request');
var brorequests = require('./brorequests');

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

// respond to facebook's verification; einmaliges aufsetzen des webhooks
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

// respond to post calls from facebook; jedes mal wenn user etwas schickt
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
            console.log("EVENT MESSAGE");
          receivedMessage(event);
        } 
         else if (event.postback) {
            console.log("EVENT POSTBACK");
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

const bros = "bros";
const restart = "restart bot";
const idOfOurPage = 643263585872797;
// wird aufgerufen von methode darüber
function receivedMessage(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

  console.log("Received message for user %d and page %d at %d with message:", 
              senderID, recipientID, timeOfMessage);

  if(senderID == idOfOurPage) {
      console.log("Detected outgoing message from our page, not handling it.");
      return;
  }
              console.log(JSON.stringify(message));

              var messageId = message.mid;

              var messageText = message.text;
              var messageAttachments = message.attachments;

              if (messageText) {

                // If we receive a text message, check to see if it matches a keyword
                // and send back the example. Otherwise, just echo the text we received.
                  if(brorequests.listContains([bros,payloadGetStarted,"generic",restart], messageText)) {
                      sendGenericMessage(senderID);
                  } else {
                      sendTextMessage(senderID, messageText + "?");
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

/**
 * SHOW THE BROS
 * @param recipientId
 */
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
            title: "TOM BAUER (Hiphop Bro)",
            subtitle: "Techie @puls_br ● Kurator @dublabde ● Things @mom_crew ● AG Pappenheim",
            item_url: "https://www.pulshackdays.de/img/logos/puls-logo.png",               
            image_url: "https://pbs.twimg.com/profile_images/680799426907107328/E33izQ7g_400x400.jpg",
            buttons: [{
              type: "postback",
              title: "Give me: HipHop!",
              payload: "Give me: HipHop!"
            }]
          }, {
            title: "JENS MILKOWSKI (Minimal Bro)",
            subtitle: "Ich bin hier, weil... ...ich gerne auf Facebook abhänge. Und sonst so ...Bass",
            item_url: "https://www.pulshackdays.de/img/logos/puls-logo.png",               
            image_url: "https://www.pulshackdays.de/img/team/jens.jpg",
            buttons: [{
              type: "postback",
              title: "Give me: Minimal!",
              payload: "Give me: Minimal!"
            }]
          }, {

            title: "ANNA BÜHLER (Indie Bro)",
            subtitle: "Netzfilter | Maymays | Podcasts | Moderatorin bei @puls_br",
            item_url: "https://www.pulshackdays.de/img/logos/puls-logo.png",               
            image_url: "https://www.pulshackdays.de/img/logos/puls-logo.png",
            buttons: [{
              type: "postback",
              title: "Give me: Indie!",
              payload: "Give me: Indie!"
            }]
          }]
        }
      }
    }
  };  

  callSendAPI(messageData);
}

/**
 * SHOW THE BROS
 * @param recipientId
 */
function sendAfterTracksMessage(recipientId, genre) {
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
                        title: "Was jetzt?",
                        subtitle: "",
                        buttons: [{
                            type: "postback",
                            title: "Mehr " + genre + " Vorschläge!",
                            payload: "Give me: "+genre+"!"
                        },{
                            type: "postback",
                            title: "Zu den Bros!",
                            payload: "bros"
                        }]
                    }]
                }
            }
        }
    };

    callSendAPI(messageData);
}

/**
 * SHOW THE TRACKS
 * @param recipientId
 * @param genre for which genre
 */
function sendTrackRecommendations(recipientId, genre) {

    console.log("Setting up track recommendations message to " + recipientId + " for " + genre);

    sendTextMessage(recipientId, "Hier sind deine Vorschläge: ");

    var sendData = function(tracks) {
        var messageData = {
            recipient: {
                id: recipientId
            },

            message: {
                attachment: {
                    type: "template",
                    payload: {
                        template_type: "generic",
                        elements: []
                    }
                }
            }
        };

        for(var i = 0; i < tracks.length; i++) {
            var track = tracks[i];
            var element = {title:track.artist,subtitle:track.name,item_url:track.url,image_url: track.thumbnail };
            messageData.message.attachment.payload.elements.push(element);
        }

        callSendAPI(messageData);

        var send = function() {
            sendAfterTracksMessage(recipientId, genre);
        };

        setTimeout(send, 2000);
    };

    brorequests.getSuggestions([], genre, 3, sendData);
}

const payloadGetStarted = "Get started";
const payloadUserDef = "USER_DEFINED_PAYLOAD";
const payloadHelp = "HILFE";
const payloadRestart = "NEUSTARTEN";
const startGiveMe = "Give me: ";
const endGiveMe = "!";

function receivedPostback(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfPostback = event.timestamp;

  // The 'payload' param is a developer-defined field which is set in a postback 
  // button for Structured Messages. 
  var payload = event.postback.payload;

  console.log("Received postback for user %d and page %d with payload '%s' " + 
    "at %d", senderID, recipientID, payload, timeOfPostback);

  if(brorequests.listContains([payloadGetStarted, payloadUserDef, startGiveMe, payloadHelp, payloadRestart, bros], payload)) {
      sendGenericMessage(senderID);
  } else if(payload.startsWith(startGiveMe)) {
      var genre = payload.substring(startGiveMe.length,payload.length-endGiveMe.length);
      sendTrackRecommendations(senderID, genre);
  } else {
      // When a postback is called, we'll send a message back to the sender to
      // let them know it was successful
      sendTextMessage(senderID, payload + "??");
  }
}

/**
 * Actually _send_ the message
 * @param messageData
 */
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
      //console.error(response);
      console.error(error);
    }
  });  
}






