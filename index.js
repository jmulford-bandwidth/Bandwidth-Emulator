const express = require('express')
const app = express()
const port = 3000
const request = require('request')

app.use(express.json())
/**
 * Handles callbacks for message delivered events
 */
function messageDeliveredEvent(responseBody) {
    //todo: set random time
    setTimeout(function() {
        var callbackBody = {
            type: "message-delivered",
            time: "2016-09-14T18:20:19Z", //current time in this format
            message: responseBody
        }
        callbackDestination = callbackDestinationLookup(responseBody["applicationId"])
        request({
            method: 'POST',
            url: callbackDestination,
            json: callbackBody
        }, function (error, response, body) {
            //do nothing
        })
    }, 4000)
}

/**
 * Looks up the URL to receive the callback based on the applicationId
 */
function callbackDestinationLookup(applicationId) {
    return "https://eaae96e9.ngrok.io/callbacks"
}

/**
 * Route to handle incoming message requests
 */
app.post('/api/v2/users/:accountId/messages', function (req, res)  {
    var accountId = req.params["accountId"]
    var requestBody = req.body
    var to = requestBody["to"]
    var from = requestBody["from"]
    var text = requestBody["text"]
    var applicationId = requestBody["applicationId"]
    var tag = requestBody["tag"]
    var segmentCount = 1 //len(text) / 160??
    var id = '123' //random string
    var time = '2016-09-14T18:20:16Z' //current time in this format
    var responseBody = {
        to: to,
        from: from,
        text: text,
        applicationId: applicationId,
        tag: tag,
        segmentCount: segmentCount,
        owner: from,
        id: id,
        time: time,
        direction: "out"
    }
    messageDeliveredEvent(responseBody)
    res.json(responseBody)
})

/**
 * Route to handle incoming callbacks
 *
 * Note that this route is not part of Bandwidth's API but simply exists as a placeholder for callbacks if needed
 */
app.post('/callbacks', function (req, res)  {
    var requestBody = req.body
    console.log(requestBody)
    res.json(requestBody)
})

app.listen(port, () => console.log(`Bandwidth Emulator-ish is now listening on port ${port}!`))
