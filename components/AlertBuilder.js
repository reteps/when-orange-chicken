import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import { TextField, Container } from '@mui/material';
import TimePicker from '@mui/lab/TimePicker';
import DateAdapter from '@mui/lab/AdapterDayjs';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import FoodSelect from 'components/FoodSelect';
import styled from 'styled-components';
import { getAuth } from 'firebase/auth';
import { query, collection, getDocs, getDoc, doc, where } from 'firebase/firestore';
import { db } from 'utils/firebase';
import Select from 'react-select';
import axios from 'axios';

export const Styled = {
  ButtonContainer: styled(Container)`
    display: flex;
    flex-direction: row;
    justify-content: space-apart;
  `,
};

const getRoundedDate = (minutes, d) => {
  let ms = 1000 * 60 * minutes; // convert minutes to ms
  let roundedDate = new Date(Math.round(d.toDate().getTime() / ms) * ms);

  return roundedDate;
};

function AlertBuilder({ setAlerts, orangeChicken }) {
  const [time, setTime] = useState(new Date());
  const [food, setFood] = useState(orangeChicken ? 'Orange Chicken' : '');
  const [meal, setMeal] = useState(orangeChicken ? 'Dinner' : '');
  const [message, setMessage] = useState('$food ');
  const [locations, setLocations] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [open, setOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(null);
  const handleTimePicker = (newValue) => {
    setTime(getRoundedDate(30, newValue));
  };

  useEffect(() => {
    setMessage(`${food} is at ${meal} in ${selectedLocations?.join(',')}.`);
  }, [food, meal, selectedLocations]);
  useEffect(async () => {
    const locationRef = query(collection(db, 'locations'));
    const locations = await getDocs(locationRef);
    const locationData = [];
    locations.forEach((location) => locationData.push(location.data()));
    console.log('Got these locations:', locationData);
    setLocations(locationData);
  }, []);
  useEffect(async () => {
    const auth = getAuth();

    console.log('AlertPage useEffect to get existing alerts & locations');
    const userDoc = await getDoc(doc(db, `users/${auth.currentUser.email}`));
    setPhoneNumber(userDoc.data().phoneNumber);

    const userAlerts = await getDocs(
      query(collection(db, 'alerts'), where('number', '==', phoneNumber)),
    );
    const data = [];
    userAlerts.forEach((alert) => data.push(alert.data()));
    console.log('Got these alerts:', data);
    setAlerts(data);
  }, []);

  const testAlert = async () => {
    const body = {
      to: `+1${phoneNumber}`,
      body: message,
    };

    console.log(`Sending body: ${JSON.stringify(body)}`);

    // TODO rate limit
    await axios.post(
      'https://us-central1-when-orange-chicken.cloudfunctions.net/sendMessage',
      body,
    );
  };
  const round30 = (x) => {
    return Math.round(x / 30) * 30;
  };
  const saveAlert = async () => {
    const timeAsRounded = time.getHours() + round30(time.getMinutes()) / 60;
    const firebaseKey = uuidv4();
    const body = {
      food,
      phoneNumber,
      message,
      time: timeAsRounded,
      meal,
      locations: selectedLocations,
    };

    await setDoc(doc(db, 'alerts', firebaseKey), ...body);
    setAlerts([...alerts, { firebaseKey, ...body }]);

    console.log(body);
  };
  const handleMealChange = (meal) => {
    // console.log(meal);
    setMeal(meal.value);
  };

  const handleLocationsChange = (locations) => {
    // console.log(locations);
    setSelectedLocations(locations.map((l) => l.value));
  };

  return (
    <form>
      Alert me at
      <LocalizationProvider dateAdapter={DateAdapter}>
        <TimePicker
          label="Time"
          value={time}
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
      <Button variant="outlined" onClick={() => setOpen(true)}>
        {food || 'Select Food'}
      </Button>
      <FoodSelect
        open={open}
        handleClose={() => setOpen(false)}
        onFoodSelect={(food) => setFood(food)}
      />
      is available at
      <FormControl>
        <Select
          options={['Breakfast', 'Lunch', 'Dinner'].map((m) => ({ value: m, label: m }))}
          label="meal"
          defaultValue={{ value: 'Breakfast', label: 'Breakfast' }}
          onChange={handleMealChange}
        />
      </FormControl>
      at{' '}
      <FormControl>
        <Select
          options={locations.map((location) => ({ value: location.name, label: location.name }))}
          setValue={(e) => {
            console.log(e);
          }}
          onChange={handleLocationsChange}
          isMulti
        />
      </FormControl>
      these locations. With this message
      <TextField
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        variant="standard"
      ></TextField>
      <Styled.ButtonContainer>
        <Button variant="outlined" color="secondary" onClick={testAlert}>
          Test Alert*
        </Button>
        <Button variant="contained" color="primary" onClick={saveAlert}>
          Save Alert
        </Button>
      </Styled.ButtonContainer>
    </form>
  );
}

export default AlertBuilder;
