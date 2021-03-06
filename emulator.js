const express = require('express') //miniframework for api
const app = express()
const port = 3000
const request = require('request') //used to make requests for callbacks
const bodyParser = require('body-parser')
require('body-parser-xml')(bodyParser) //used for express to parse incoming xml objects
const xml2js = require('xml2js') //used to parse outgoing xml objects

app.use(express.json())
app.use(bodyParser.xml())

//Simple in-memory data structure for storing applications
applications = {}

//Simple in-memory storage for rate limiting
rateLimits = {
    countLimit: 10, //messages per minute
    currentCount: 0,
    resetTime: new Date().getTime()
}

/**
 * Generates random string
 *
 * Taken from https://gist.github.com/6174/6062387
 */
function randomString() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

/**
 * Gets the current datetime in ISO format
 */
function getCurrentDateTime() {
    return new Date().toISOString()
}

/**
 * Generates a random time to delay events up to 10 seconds
 */
function randomTime() {
    return Math.random() * 10000
}

/**
 * Handles callbacks for message delivered events
 */
function messageDeliveredEvent(responseBody) {
    setTimeout(function() {
        var callbackBody = [{
            type: "message-delivered",
            time: getCurrentDateTime(),
            message: responseBody
        }]
        callbackDestination = callbackDestinationLookup(responseBody["applicationId"])
        request({
            method: 'POST',
            url: callbackDestination,
            json: callbackBody
        }, function (error, response, body) {
            //do nothing
        })
    }, randomTime())
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
    if (rateLimits['resetTime'] <= new Date().getTime()) {
        rateLimits['resetTime'] = new Date().getTime()
        rateLimits['currentCount'] = 0
    }

    if (rateLimits['currentCount'] === 0) {
        rateLimits['resetTime'] = new Date().getTime() + (1000 * 60)
    }

    rateLimits['currentCount'] += 1
    if (rateLimits['currentCount'] >= rateLimits['countLimit']) {
        var responseBody = {
            type: "max-message-queue-size-exceeded",
            description: "The SMS queue for your account is full and cannot accept more messages right now. Your allowed rate is 60 messages per minute. The capacity of this queue is 10 messages (1 minute). Reduce your message sending rate, or contact support to increase your allowed rate."
        }
        res.json(responseBody)
    }
    else {
        var accountId = req.params["accountId"]
        var requestBody = req.body
        var to = requestBody["to"]
        var from = requestBody["from"]
        var text = requestBody["text"]
        var applicationId = requestBody["applicationId"]
        var tag = requestBody["tag"]
        var segmentCount = text.length/160
        var id = randomString()
        var time = getCurrentDateTime() 
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
    }
})

/**
 * Route to handle creating a new application
 *
 * expects xml body
 */
app.post('/api/accounts/:account/applications', function (req, res)  {
    var requestBody = req.body["Application"]
    var applicationId = randomString() 
    //Not sure what jank is making all of these arrays but they're all arrays with 1 element...
    var serviceType = requestBody["ServiceType"][0]
    var appName = requestBody["AppName"][0]
    var callbackUrl = requestBody["CallbackUrl"][0]
    var userId = requestBody["CallbackCreds"][0]["UserId"][0]
    var password = requestBody["CallbackCreds"][0]["Password"][0]
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
    applications[applicationId] = responseBody["ApplicationProvisioningResponse"]["Application"]
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

app.listen(port, () => console.log(`Bandwidth Emulator is now listening on port ${port}!`))
