export const DEAD_LETTERS = [
  {
    id: '406c1633-0a9a-472b-ab9b-8d87fe438386',
    originalMessage: '{"cif":"acc44","wallet":"PayPal","destinationOfFund":"08123456789","amount":0,"eventId":"77199394-6bd9-4177-9c10-668a26ff2d9d"}',
    reason: 'Source account with CIF acc44 not found',
    originTopics: [
      {
        name: 'EVENT_TOP_UP_REQUEST'
      }
    ],
    createdDate: '2020-01-01'
  },
  {
    id: 'dc94f6df-679c-496e-887d-1f79b378a1b9',
    originalMessage: '{"cif":"acc55","wallet":"PayPal","destinationOfFund":"08123456789","amount":0,"eventId":"23a8079d-d085-4074-9701-ed890e37dfd3"}',
    reason: 'Source account with CIF acc55 not found',
    originTopics: [
      {
        name: 'SURROUNDING_NOTIFICATION'
      }
    ],
    createdDate: '2020-03-01'
  }];

export default DEAD_LETTERS;
