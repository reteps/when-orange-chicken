// import './App.css';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { provider, db } from '../utils/firebase';
// import getMenu from './utils/food';
import {
  signInWithPopup,
  getAuth,
  // GoogleAuthProvider,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

function App() {
  const auth = getAuth();
  const [authorized, setAuthorized] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [food, setFood] = useState('');
  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        setAuthorized(true);
      } else {
        setAuthorized(false);
      }
    });
  });
  const [text, setText] = useState('value');
  const handleSignout = (e) => {
    return auth
      .signOut()
      .then(() => {
        console.log(auth.currentUser);
        setAuthorized(false);
        setText('Signed out.');
      })
      .catch((e) => {
        console.error(e);
      });
    // auth.currentUser = null;
  };
  const handleOpenID = (e) => {
    console.log('Clicked');
    setPersistence(auth, browserLocalPersistence).then(async () => {
      try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        console.log('currentuser', auth.currentUser);
        if (!user.email.includes('illinois.edu')) {
          console.log();
          handleSignout().then(() => {
            setText('That is not an illinois gmail, signing you out again.');
          });
          return;
        }
        setAuthorized(true);
        setText('Signed in successfully');
      } catch (error) {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorMessage);
        // Handle Errors here.

        // The email of the user's account used.
        // const email = error.email;
        // The AuthCredential type that was used.
        // const credential = GoogleAuthProvider.credentialFromError(error);
        // ...
      }
    });
  };
  const updatePrefs = async (e) => {
    e.preventDefault();
    console.log('updated');
    console.log(food);
    console.log(phoneNumber);
    await setDoc(doc(db, 'users', auth.currentUser.email), {
      email: auth.currentUser.email,
      phoneNumber,
      food,
    });
  };
  const getMenuWrapper = async () => {
    const d = new Date();
    const today = d.toLocaleDateString().replaceAll('/', '-');
    const menuItems = new Set(
      (await axios.get('/api/list/' + today)).data.map((item) => item.FormalName),
    );
    console.log(menuItems);
  };
  return (
    <div className="App">
      {authorized ? (
        <>
          <button onClick={handleSignout}> Sign out </button>

          <form onSubmit={updatePrefs}>
            <input
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="phone number"
            ></input>
            <input
              value={food}
              onChange={(e) => setFood(e.target.value)}
              placeholder="food"
            ></input>
            <button type="submit"> Update preferences </button>
          </form>
        </>
      ) : (
        <>
          <button onClick={handleOpenID}> Please sign in with your illinois GMAIL </button>
          <div>{text}</div>
        </>
      )}
      <button onClick={getMenuWrapper}> fadsdfasdf </button>
    </div>
  );
}

export default App;
