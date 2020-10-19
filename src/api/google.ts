import { IGoogleEmail, IGoogleMessagePartBody } from './types.d';
declare global {
  interface Window {
    gapi: any;
  }
}
window.gapi = window.gapi || {};

const { REACT_APP_GOOGLE_CLIENT_ID, REACT_APP_GMAIL_API_KEY } = process.env;
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest"];
const SCOPES = 'https://www.googleapis.com/auth/gmail.readonly';
const GAPI_CONFIG = {
  apiKey: REACT_APP_GMAIL_API_KEY,
  clientId: REACT_APP_GOOGLE_CLIENT_ID,
  discoveryDocs: DISCOVERY_DOCS,
  scope: SCOPES
};

export async function loadGAPI() {
  let loaded = false;
  let errorMessage: string | null = 'null';

  const gapiClientLoad = new Promise((resolve, reject) => {
    setTimeout(() => {
      window.gapi.load('client:auth2', async () => {
        try {
          await window.gapi.client.init(GAPI_CONFIG);
          resolve({ errorMessage, loaded: true });
        } catch (gapiErrorResponse) {
          errorMessage = gapiErrorResponse.error?.message || gapiErrorResponse.error;
          reject({ error: errorMessage, loaded });
        }
      })
    }, 1000);
  });
  return gapiClientLoad;
}

export async function isUserAuthenticated() {
  const isAuthenticated = window.gapi.auth2.getAuthInstance().isSignedIn.get();
  return isAuthenticated;
}

const createGoogleUserProfile = (googleUser: any) => {
  if (googleUser) {
    const { Ad: name, Wt: email } = googleUser;
    return { name, email };
  }
  return googleUser;
}

export async function getCurrentUserProfile() {
  const googleUser = window.gapi.auth2.getAuthInstance().currentUser.get();
  const currentUserProfile = createGoogleUserProfile(googleUser.nt);
  return currentUserProfile;
}

export async function signOutUser() {
  window.gapi.auth2.getAuthInstance().signOut();
}

export async function authenticateUser() {
  window.gapi.auth2.getAuthInstance().signIn();
}

async function getEmailAttachment(messagedId: string, attachmentId: string) {
  const response = await window.gapi.client.gmail.users.messages.attachments.get({
    id: attachmentId,
    messageId: messagedId,
    userId: 'me',
  });
  return response;
}

async function getEmailAttachments(email: IGoogleEmail) {
  const { parts } = email.payload;
  let attachmentQueries:Array<any> = [];

  for (let index = 0; index < parts.length; index++) {
    const { body } = parts[index];
    if (body && body.attachmentId) {
      attachmentQueries = [...attachmentQueries, getEmailAttachment(email.id, body.attachmentId)];
    }
  }

  try {
    const attachments: Array<IGoogleMessagePartBody> = await Promise.all(attachmentQueries)
    return attachments;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function getAllEmailAttachments(emails: Array<IGoogleEmail>) {
  let resolvedEmails:Array<any> = [];
  let resolvedAttachments:Array<any> = [];

  const emailQueries = emails.map((email: any) => {
    return window.gapi.client.gmail.users.messages.get({
      userId: 'me',
      id: email.id
    })
  });

  try {
    resolvedEmails = await Promise.all(emailQueries);
  } catch (error) {
    return Promise.reject(error);
  }

  try {
    const attachmentQueries = resolvedEmails.map((email) => getEmailAttachments(email.result));
    resolvedAttachments = await Promise.all(attachmentQueries);
    return resolvedAttachments;
  } catch (error) {
    return Promise.reject(error);
  }
}

/**
 * @see: Search operators - https://support.google.com/mail/answer/7190
 * @param queryString
 */
export async function getUserEmails(queryString: string): Promise<any> {
  const loadUserEmails = new Promise((resolve, reject) => {
    setTimeout(async() => {
      try {
        const { result } = await window.gapi.client.gmail.users.messages.list({
          userId: 'me',
          // maxResults: 10,
          q: `${queryString} has:attachment`
        });
        const emails:Array<IGoogleEmail> = result.messages;
        resolve({ emails });
      } catch (apiError) {
        const errorMessage = apiError?.message || apiError.error;
        reject({ error: errorMessage });
      }
    }, 1000);
  });

  return loadUserEmails;
}
