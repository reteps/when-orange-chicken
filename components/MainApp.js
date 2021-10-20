import React from 'react';


function MainApp() {
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

(
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
      <Button type="submit" variant="contained">
        {' '}
        Update preferences{' '}
      </Button>
    </form>
    <div>
      Alert me at
      <LocalizationProvider dateAdapter={DateAdapter}>
        <TimePicker
          label="Time"
          value={value}
          onChange={handleTimePicker}
          renderInput={(params) => <TextField {...params} />}
          shouldDisableTime={(timeValue, clockType) => {
            if (
              clockType === 'minutes' &&
              !(timeValue <= 4 || timeValue >= 56 || (timeValue >= 26 && timeValue <= 34))
            ) {
              return true;
            }

            return false;
          }}
        />
      </LocalizationProvider>
      when
      <FoodSelect />
      is available at
      <FormControl fullWidth>
        <InputLabel id="demo-simple-select-label">Age</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={age}
          label="Age"
          onChange={handleChange}
        >
          <MenuItem value={10}>Breakfast</MenuItem>
          <MenuItem value={20}>Lunch</MenuItem>
          <MenuItem value={30}>Dinner</MenuItem>
        </Select>
      </FormControl>{' '}
      With this message
      <TextField
        placeholder={'$food is at $meal in $locations.'}
        helperText="You can use the variables '$food' '$meal' '$locations'"
      ></TextField>
    </div>
    <div> Added alerts> </div>
    <div>TODO for alERT IN ALERTS</div>
    <Button> Add another alert </Button>
    <form></form>
  </>
) : (
  <>
    <button onClick={handleOpenID}> Please sign in with your illinois GMAIL </button>
    <div>{text}</div>
  </>
)
}
