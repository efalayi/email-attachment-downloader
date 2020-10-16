declare global {
  interface Window {
    gapi: any;
  }
}

window.gapi = window.gapi || {};

const env = process.env;
const { REACT_APP_GOOGLE_CLIENT_ID, REACT_APP_GMAIL_API_KEY } = env;

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
    const {
      ofa: firstName,
      wea: lastName,
      Paa: picture,
      U3: email
    } = googleUser;

    return { firstName, lastName, picture, email };
  }
  return googleUser;
}

export async function getCurrentUserProfile() {
  const googleUser = window.gapi.auth2.getAuthInstance().currentUser.get();
  const currentUserProfile = createGoogleUserProfile(googleUser.w3);
  return currentUserProfile;
}

export async function signOutUser() {
  window.gapi.auth2.getAuthInstance().signOut();
}

export async function authenticateUser() {
  signOutUser();
  window.gapi.auth2.getAuthInstance().signIn();
}
