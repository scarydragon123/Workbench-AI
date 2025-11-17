import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import { firebaseConfig } from "./firebaseConfig";

// FIX: Use Firebase v8 compatible initialization. This ensures the app doesn't crash if initialized multiple times (e.g., in React strict mode).
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// FIX: Export auth and db services using the v8 namespaced API.
export const auth = firebase.auth();
export const db = firebase.firestore();
