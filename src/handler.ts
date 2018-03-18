import * as Alexa from 'alexa-sdk';

export const alexaLocation = async (event: Alexa.RequestBody<Alexa.Request>, context: Alexa.Context, cb: (err: any, response: any) => void) => {
  const alexa  = Alexa.handler(event, context, cb);
  alexa.resources = {};
  alexa.registerHandlers(handlers);
  alexa.execute();
}

const handlers: Alexa.Handlers<Alexa.Request> = {
  'LaunchRequest': function(){
    this.emit('SayHello');
  },
  'HelloWorldIntent': function(){
    this.emit('SayHello');
  },
  'SayHello': function(){
    this.emit(':tell', 'Hello World!');
  }
}
