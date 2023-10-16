import {
  ApiError,
  Client,
  DependentField1,
  EnvelopesAPIController,
  Party,
  URLEnvelope,
  WebhookCreation,
  WebhookEvents,
  WebhooksAPIController
} from './foxit_sdk/src/index.ts';

class foxitApiHelper{

    constructor(){

    }


    /*
    **
    * Create a Document form URL and Send it to Signers
    **
    */
    static async createDocumentFromURL(pdfUrl, pdfFileName){
      // Intitiante the API Client Using Foxit SDK
      const client = new Client({
        timeout: 0,
        environment: 'US Server',
        accessToken: process.env.FOXIT_ACCESS_TOKEN
      });

      const envelopesAPIController = new EnvelopesAPIController(client);
      const bodyFileUrls: string[] = [pdfUrl];
      const bodyFileNames: string[] = [pdfFileName];
      const bodyParties: Party[] = [];

      const bodyparties0: Party = {
        firstName: 'John',
        lastName: 'Doe',
        emailId: 'youremail@gmail.com',
        permission: 'FILL_FIELDS_AND_SIGN',
        sequence: 1,
      };

      bodyParties[0] = bodyparties0;

      const body: URLEnvelope = {
        folderName: 'Foxit Communication Agreement',
        fileUrls: bodyFileUrls,
        fileNames: bodyFileNames,
        parties: bodyParties,
        numberOfParties: 1,
        createEmbeddedSigningSession: true,
        processTextTags: true,
        processAcroFields: true,
        inputType: 'url',
        sendNow: true,
        createEmbeddedSigningSessionForAllParties: true
      };

      try {
        const { result, ...httpResponse } = await envelopesAPIController.createEnvelopeFromURL(body);
        console.log('result:')
        console.log(result)
        return result

      } catch(error) {
        if (error instanceof ApiError) {
          const errors = error.result;
          const { statusCode, headers } = error;
          console.log('error: ')
          console.log(errors)
        }
      }
    }

    /*
    **
    * Create a Webhook Channel
    **
    */
    static async createWebhookChannel(){
      // Intitiante the API Client Using Foxit SDK
      const client = new Client({
        timeout: 0,
        environment: 'US Server',
        accessToken: process.env.FOXIT_ACCESS_TOKEN

      });

      // Send a webhook when a folder is viewed or signed
      const webhooksAPIController = new WebhooksAPIController(client);
      const bodyEvents: WebhookEvents = {};
      bodyEvents.folderViewed = true;
      bodyEvents.folderSigned = true;

      // Create the Request body
      const body: WebhookCreation = {
        channelName: 'Viewed and Signed Webhook',
        webhookUrl: `${process.env.BASE_URL}/api/foxit-webhooks`,
        webhookLevel: 'Account',
        events: bodyEvents,
      };

      console.log(body.webhookUrl)
      try {
        const { result, ...httpResponse } = await webhooksAPIController.createWebhookChannel(body);
        console.log('result:')
        console.log(result)
      } catch(error) {
        if (error instanceof ApiError) {
          const errors = error.result;
          const { statusCode, headers } = error;
          console.log('error: ')
          console.log(errors)
        }
      }
    }
}

export {foxitApiHelper}