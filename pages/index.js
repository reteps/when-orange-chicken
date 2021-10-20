// import './App.css';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { provider, db } from 'utils/firebase';
// import getMenu from './utils/food';
import {
  signInWithPopup,
  getAuth,
  // GoogleAuthProvider,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import Button from '@mui/material/Button';
import { IconButton, TextField, Toolbar } from '@mui/material';
import TimePicker from '@mui/lab/TimePicker';
import DateAdapter from '@mui/lab/AdapterDayjs';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import AppBar from '@mui/material/AppBar'
import FoodSelect from 'components/FoodSelect';
function App() {
  const auth = getAuth();
  const [value, setValue] = useState(new Date('2014-08-18T12:00:00'));
  const [authorized, setAuthorized] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [food, setFood] = useState('');
  const [age, setAge] = useState('');

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
  const handleTimePicker = (newValue) => {
    let getRoundedDate = (minutes, d) => {
      let ms = 1000 * 60 * minutes; // convert minutes to ms
      let roundedDate = new Date(Math.round(d.toDate().getTime() / ms) * ms);

      return roundedDate;
    };
    setValue(getRoundedDate(30, newValue));
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
    const today = new Date().toLocaleDateString().replaceAll('/', '-');
    const menuItems = (await axios.get('/api/list/' + today)).data.map((item) => item);
    console.log(menuItems);
  };

  const handleChange = (event) => {
    setAge(event.target.value);
  };

  return (
    <div className="App">
      <AppBar>
        <Toolbar>
          <IconButton>
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      {authorized ? <MainApp /> :}
      <button onClick={getMenuWrapper}> fuck you </button>
    </div>
  );
}

export default App;
