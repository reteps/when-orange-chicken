// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { GoogleAuthProvider } from 'firebase/auth';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyDzHQwojkjVceAWNmTdyBxH85oAjRr2mps',
  authDomain: 'when-orange-chicken.firebaseapp.com',
  projectId: 'when-orange-chicken',
  storageBucket: 'when-orange-chicken.appspot.com',
  messagingSenderId: '742178988691',
  appId: '1:742178988691:web:680df2ca0d46993b066366',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/userinfo.email');

export { db, provider };
