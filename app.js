"use strict"
const WebSocket = require('ws')
const request = require('request')

var ws = new WebSocket(process.env.sakuraWsUri)

ws.on('open', (data, flags) => {
  console.log('opened')
})

ws.on('message', (data, flags) => {
  console.log('data', data)
  const dataJson = JSON.parse(data)
  if (dataJson.payload) {
    if (dataJson.payload.channels) {
      const channels = dataJson.payload.channels

      console.log('channels')
      console.log(channels)

      const panelVoltage = valueFromChannels(channels, 0)
      const chargeAmpere = valueFromChannels(channels, 1)
      const batteryVoltage = valueFromChannels(channels, 2)
      const chargeWatt = valueFromChannels(channels, 3)
      postToThingSpeak(panelVoltage, chargeAmpere, batteryVoltage, chargeWatt)
    }
  }
})

const valueFromChannels = (channels, channel) => {
  const candidates = channels.filter((c) => {return c.channel == channel})
  return candidates[0].value
}

const postToThingSpeak = (panelVoltage, chargeAmpere, batteryVoltage, chargeWatt) => {
  postData('https://api.thingspeak.com/update.json',
           panelVoltage, chargeAmpere, batteryVoltage, chargeWatt);
  // postData('https://asukiaaa.webscript.io/hoge',
  //          panelVoltage, chargeAmpere, batteryVoltage, chargeWatt);
}

const postData = (url, panelVoltage, chargeAmpere, batteryVoltage, chargeWatt) => {
  request({
    method: 'post',
    url: url,
    json: {
      api_key: process.env.thingspeakApiKey,
      field1: panelVoltage,
      field2: chargeAmpere,
      field3: batteryVoltage,
      field4: chargeWatt
    }}, (err, response, body) => {
      console.log('sent to server')
      if (err) {
        console.log('err')
        console.log('body', body)
      }
    })
}

//  {"module":"uGn9fKYqdl25","type":"channels","datetime":"2016-11-25T13:42:42.785480391Z","payload":{"channels":[{"channel":0,"type":"f","value":33,"datetime":"2016-11-25T13:42:42.73848225Z"},{"channel":1,"type":"f","value":2,"datetime":"2016-11-25T13:42:42.75048225Z"},{"channel":2,"type":"f","value":20,"datetime":"2016-11-25T13:42:42.76248225Z"},{"channel":3,"type":"f","value":40,"datetime":"2016-11-25T13:42:42.77448225Z"}]}},
