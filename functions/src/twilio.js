import twilio from 'twilio';

const client = new twilio(accountSid, authToken);

export default client;
