import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const config = {
    apiKey: "----",
    authDomain: "----",
    projectId: "----",
    storageBucket: "----",
    messagingSenderId: "----",
    appId: "----"
};

const app = initializeApp(config);
export const auth = getAuth(app);
export default app;



