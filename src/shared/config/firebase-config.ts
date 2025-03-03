import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, initializeFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";
// Your web app's Firebase configuration  *in production
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDrjAQrAEE4OlehsqwsKCiOQJn8Pj7h3tA",
  authDomain: "bipa-pms.firebaseapp.com",
  projectId: "bipa-pms",
  storageBucket: "bipa-pms.firebasestorage.app",
  messagingSenderId: "35829525892",
  appId: "1:35829525892:web:ed641282ecd3d371a241d1",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const appAuthWorker = initializeApp(firebaseConfig, "authWorker");

export const auth = getAuth(app);
export const authWorker = getAuth(appAuthWorker);

export const analytics = getAnalytics(app);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});
export const firestore = db;

export const storage = getStorage(app);
export const functions = getFunctions(app);
