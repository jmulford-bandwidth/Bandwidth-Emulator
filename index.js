const express = require('express')
const app = express()
const port = 3000
const request = require('request')
const bodyParser = require('body-parser')
require('body-parser-xml')(bodyParser)
const xml2js = require('xml2js')

app.use(express.json())
app.use(bodyParser.xml())

applications = {}

/**
 * Handles callbacks for message delivered events
 */
function messageDeliveredEvent(responseBody) {
    //todo: set random timeout time, set callbackBody time
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
    return applications[applicationId]["CallbackUrl"]
}

/**
 * Route to handle incoming message requests
 */
app.post('/api/v2/users/:accountId/messages', function (req, res)  {
    //todo: fix segmentCount, id, and time
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
 * Route to handle creating a new application
 */
app.post('/api/accounts/:account/applications', function (req, res)  {
    var requestBody = req.body["Application"]
    var applicationId = "1234" //generate random string
    var serviceType = requestBody["ServiceType"]
    var appName = requestBody["AppName"]
    var callbackUrl = requestBody["CallbackUrl"]
    var userId = requestBody["CallbackCreds"][0]["UserId"]
    var password = requestBody["CallbackCreds"][0]["Password"]
    var responseBody = {
        ApplicationProvisioningResponse: {
            Application: {
                ApplicationId: applicationId,
                ServiceType: serviceType,
                AppName: appName,
                CallbackUrl: callbackUrl,
                CallbackCreds: {
                    UserId: userId,
                    Password: password
                }
            }
        }
    }
    var builder = new xml2js.Builder()
    var xmlString = builder.buildObject(responseBody)
    res.set('Content-Type', 'application/xml')
    res.send(xmlString)
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
