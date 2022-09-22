import { initializeApp } from "firebase/app";
import { getDatabase } from 'firebase/database';

const firebaseConfiguration = {
    apiKey: "AIzaSyCAf5Ypk2Pdsm1P3Ahl6YfnQk4kjJf38aw",
    authDomain: "mapboxglreact.firebaseapp.com",
    projectId: "mapboxglreact",
    storageBucket: "mapboxglreact.appspot.com",
    messagingSenderId: "926324552512",
    appId: "1:926324552512:web:568b361ba4b7a4ccf5c0a5",
    measurementId: "G-WM3HJH2KRB"
}

const app = initializeApp(firebaseConfiguration);
export const db = getDatabase(app);