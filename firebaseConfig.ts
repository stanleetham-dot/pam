import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Placeholder check
const isConfigured = process.env.API_KEY && process.env.API_KEY !== "YOUR_API_KEY";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};

// Initialize Firebase only if configured, otherwise export null to prevent crash
const app = isConfigured ? initializeApp(firebaseConfig) : null;

// Initialize Firestore
export const db = app ? getFirestore(app) : null;