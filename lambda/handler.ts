import * as Alexa from 'alexa-sdk';
import { AlexaDeviceAddressClient } from './alexa-device-address.client';

export const location = (event: Alexa.RequestBody<Alexa.Request>, context: Alexa.Context, cb: (err: any, response: any) => void) => {
  console.log(`${JSON.stringify(event, null, 4)}`);
  const alexa = Alexa.handler(event, context, cb);
  alexa.appId = process.env.APP_ID;
  alexa.resources = {};
  alexa.registerHandlers(handlers);
  alexa.execute();
}

const getAddressHandler = function () {
  const accessToken = this.event.context.System.apiAccessToken;
  const deviceId = this.event.context.System.device.deviceId;
  const apiEndpoint = this.event.context.System.apiEndpoint;

  const alexaDeviceAddressClient = new AlexaDeviceAddressClient(apiEndpoint, deviceId, accessToken);

  const deviceAddressRequest = alexaDeviceAddressClient.getFullAddress().then((addressResponse: any) => {
    switch (addressResponse.statusCode) {
      case 200:
        const address = addressResponse.address;

        const slot = this.event.request.intent.slots.LocationType.value;

        this.emit(':tell', getAddressMessage(address, slot));
        break;
      case 204:
        // Most likely doesn't have an address on file in the companion app.
        this.emit(':tell', 'You have no address on file.');
        break;
      case 403:
        this.emit(':tellWithPermissionCard', 'You have refused to allow where am I access to the address information in the Alexa app. Where am I cannot function without address information. To permit access to address information, enable where am I again, and consent to provide address information in the Alexa app.', ["read::alexa:device:all:address"]);
      default:
        this.emit(':tell', 'Location lookup failed.');
    }
  });

  deviceAddressRequest.catch((err) => {
    this.emit(':tell', 'Something is wrong.');
  });
};

const handlers: Alexa.Handlers<Alexa.Request> = {
  'LaunchRequest': function () {
    this.emit(":ask", "Welcome to Where Am I.  What would you like to know?");
  },
  'NewSession': function () {
    this.emit("LaunchRequest");
  },
  'SessionEndedRequest': function () {
    console.info('Session has ended');
    this.emit(':tell', 'Goodbye!');
  },
  'Unhandled': function () {
    this.emit(':ask', "I don't understand.  Please try something else.");
  },
  'GetAddress': getAddressHandler
};

const getAddressMessage = function (address: any, slot: string): string {
  let addressPiece = '';
  if (slot === 'county' || slot === 'district') {
    addressPiece = address.districtOrCounty;
  } else if (slot === 'state' || slot === 'region' || slot === 'state code') {
    addressPiece = address.stateOrRegion;
  } else if (slot === 'city') {
    addressPiece = address.city;
  } else if (slot === 'country' || slot === 'country code') {
    addressPiece = address.countryCode;
  } else if (slot === 'address' || slot === 'address line 1') {
    addressPiece = address.addressLine1;
  } else if (slot === 'address line 2') {
    addressPiece = address.addressLine2;
  } else if (slot === 'address line 3') {
    addressPiece = address.addressLine3;
  }

  return `Your ${slot} is ${addressPiece}`;
}