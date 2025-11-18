// Import for side-effects to load the scripts from CDN.
import "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import { firebaseConfig } from "./firebaseConfig";

// The UMD scripts from the CDN attach the firebase object to the window.
const firebaseApp = (window as any).firebase;

// Initialize Firebase if it hasn't been already.
if (firebaseApp && !firebaseApp.apps.length) {
    firebaseApp.initializeApp(firebaseConfig);
    const firestore = firebaseApp.firestore();

    // Apply settings to Firestore.
    // These settings can improve connection reliability in restricted network environments
    // by avoiding WebSockets (forceLongPolling) and gRPC-web streams (useFetchStreams: false).
    firestore.settings({
        experimentalForceLongPolling: true,
        useFetchStreams: false,
    });

    // Enable offline persistence
    firestore.enablePersistence()
      .catch((err: any) => {
          if (err.code == 'failed-precondition') {
              // Multiple tabs open, persistence can only be enabled
              // in one tab at a time.
              console.warn("Firestore persistence failed: multiple tabs open.");
          } else if (err.code == 'unimplemented') {
              // The current browser does not support all of the
              // features required to enable persistence
              console.warn("Firestore persistence not available in this browser.");
          }
      });
}

// Get a reference to the auth service
export const auth = firebaseApp.auth();

// Get a reference to the Firestore service
export const db = firebaseApp.firestore();