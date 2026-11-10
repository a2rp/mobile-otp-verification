import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const config = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

const requiredConfigKeys = ["apiKey", "authDomain", "projectId", "appId"];

export const isFirebaseConfigured = requiredConfigKeys.every((key) =>
    Boolean(config[key]?.trim()),
);

const app = isFirebaseConfigured ? initializeApp(config) : null;
export const auth = app ? getAuth(app) : null;
export default app;



