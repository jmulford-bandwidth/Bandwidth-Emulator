# Bandwidth Messaging API Emulator

An API Emulator for Bandwidth's Messaging and Account Management APIs. 

This tool is used for developers who want to become familiar with Bandwidth's Messaging and Account Management APIs without having to directly make API calls against these APIs. After installing, simply run `node emulator.js` to start the emulator. API requests on the server url (default: localhost:3000) can be made to create a [Messaging Application](https://dev.bandwidth.com/v2-messaging/applications/postApplications.html) and send a [Text Message](https://dev.bandwidth.com/v2-messaging/methods/createMessage.html). [Callbacks](https://dev.bandwidth.com/v2-messaging/events/messageEvents.html) are sent to your callback URL defined in the Messaging Application for messages sent and received.

Take note that since this tool does not interact with Bandwidth's Messaging and Account Management APIs, the experience against these APIs live will be slightly different
* Requests made on this tool will not actually send text messages or create Bandwidth applications
* The base URLs for the Messaging and Account Management APIs are messaging.bandwidth.com and dashboard.bandwidth.com respectively. This emulator uses these APIs on the same end point for simplicity purposes
* Authentication is limited to having a valid application ID for sending a message. Account IDs, usernames, password, phone numbers, API tokens, and API secrets are not necessary.
  * Note: some value for Account ID must be defined in the URL for making requests. Any value like `1234` will be sufficient

Future development plans will include emulation of 429 error codes, and other stuff that we deem necessary

## Commands

Clone and enter the repo
```
git clone git@github.com:jmulford-bandwidth/Bandwidth-Emulator.git
cd Bandwidth-Emulator
```

Install dependencies
```
npm install
```

Launch the server
```
node emulator.js
```

Display sample HTTP requests
```
cat curl-examples.txt
```

Sample HTTP requests and responses flow
```
$ curl -X POST http://localhost:3000/api/accounts/ID/applications -d '<Application>    <ServiceType>Messaging-V2</ServiceType>    <AppName>Production Server</AppName>    <CallbackUrl>http://my-req-bin.herokuapp.com/tr3zcctr</CallbackUrl>    <CallbackCreds>      <UserId>Your-User-id</UserId>      <Password>Your-Password</Password>  </CallbackCreds></Application>' --header 'content-type: application/xml'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<ApplicationProvisioningResponse>
  <Application>
    <ApplicationId>rvz2cfvm34xsnyt1vubapf249phjkygcomshws06ue</ApplicationId>
    <ServiceType>Messaging-V2</ServiceType>
    <AppName>Production Server</AppName>
    <CallbackUrl>http://my-req-bin.herokuapp.com/tr3zcctr</CallbackUrl>
    <CallbackCreds>
      <UserId>Your-User-id</UserId>
      <Password>Your-Password</Password>
    </CallbackCreds>
  </Application>
</ApplicationProvisioningResponse>

$ curl -X POST http://localhost:3000/api/v2/users/ID/messages -d '{ "from": "+18888888888", "to": "+19999999999",ag", "applicationId": "rvz2cfvm34xsnyt1vubapf249phjkygcomshws06ue"}' --header 'content-type: application/json'
{"to":"+19999999999","from":"+18888888888","text":"Hi friend","applicationId":"rvz2cfvm34xsnyt1vubapf249phjkygcomshws06ue","tag":"My tag","segmentCount":0.05625,"owner":"+18888888888","id":"7n0lkh9jdbd4n0yenvjx3nh2e4rg7rvg4aekc4hxw9v","time":"2019-05-31T18:19:27.209Z","direction":"out"} 
```

From the above flow, a callback similar to the one shown below will be sent to the `CallbackUrl`
```
[{"type":"message-delivered","time":"2019-05-31T18:19:34.024Z","message":{"to":"+19999999999","from":"+18888888888","text":"Hi friend","applicationId":"rvz2cfvm34xsnyt1vubapf249phjkygcomshws06ue","tag":"My tag","segmentCount":0.05625,"owner":"+18888888888","id":"7n0lkh9jdbd4n0yenvjx3nh2e4rg7rvg4aekc4hxw9v","time":"2019-05-31T18:19:27.209Z","direction":"out"}}]
```
