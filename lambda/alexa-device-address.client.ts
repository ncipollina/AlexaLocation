import * as Https from 'https';

export class AlexaDeviceAddressClient {
    deviceId: string;
    consentToken: string;
    endpoint: string;
    constructor(apiEndpoint, deviceId, consentToken) {
        this.deviceId = deviceId;
        this.consentToken = consentToken;
        this.endpoint = apiEndpoint.replace(/^https?:\/\//i, "");
    }

    getFullAddress(): Promise<any> {
        const options = this.__getRequestOptions(`/v1/devices/${this.deviceId}/settings/address`);

        return new Promise((fulfill, reject) => {
            this.__handleDeviceAddressApiRequest(options, fulfill, reject);
        });
    }

    getCountryAndPostalCode(): Promise<any> {
        const options = this.__getRequestOptions(
            `/v1/devices/${this.deviceId}/settings/address/countryAndPostalCode`);

        return new Promise((fulfill, reject) => {
            this.__handleDeviceAddressApiRequest(options, fulfill, reject);
        });
    }

    __handleDeviceAddressApiRequest(requestOptions, fulfill, reject) {
        Https.get(requestOptions, (response) => {
            console.log(`Device Address API responded with a status code of : ${response.statusCode}`);

            response.on('data', (data: string) => {
                let responsePayloadObject = JSON.parse(data);

                const deviceAddressResponse = {
                    statusCode: response.statusCode,
                    address: responsePayloadObject
                };

                fulfill(deviceAddressResponse);
            });
        }).on('error', (e) => {
            console.error(e);
            reject();
        });
    }
    
    __getRequestOptions(path) {
        return {
            hostname: this.endpoint,
            path: path,
            method: 'GET',
            'headers': {
                'Authorization': 'Bearer ' + this.consentToken
            }
        };
    }
}