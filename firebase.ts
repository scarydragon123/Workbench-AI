
// Fix: Use Firebase v8 syntax for initialization to resolve import errors.
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import { firebaseConfig } from "./firebaseConfig";

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get a reference to the auth service
export const auth = firebase.auth();

// Get a reference to the Firestore service
export const db = firebase.firestore();
