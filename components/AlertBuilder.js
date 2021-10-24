import React, { useState, useEffect, useRef } from 'react';
import Button from '@mui/material/Button';
import { TextField, Container, Box, Typography } from '@mui/material';
import TimePicker from '@mui/lab/TimePicker';
import DateAdapter from '@mui/lab/AdapterDayjs';
import Grid from '@mui/material/Grid';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import FoodSelect from 'components/FoodSelect';
import styled from 'styled-components';
import { getAuth } from 'firebase/auth';
import { query, collection, getDocs, getDoc, doc, where, setDoc } from 'firebase/firestore';
import { db } from 'utils/firebase';
import Select from 'react-select';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { withSnackbar } from 'components/SnackbarWrapper';
export const Styled = {
  ButtonContainer: styled(Container)`
    display: flex;
    flex-direction: row;
    justify-content: center;
  `,
  Box: styled(Box)`
    display: flex;
    justify-content: center;
    flex-direction: row;
    align-items: baseline;
    padding-top: 0.5em;
  `,
};

const getRoundedDate = (minutes, d) => {
  let ms = 1000 * 60 * minutes; // convert minutes to ms
  let roundedDate = new Date(Math.round(d.toDate().getTime() / ms) * ms);

  return roundedDate;
};

function AlertBuilder({ addAlert, phoneNumber, orangeChicken, snackbarShowMessage }) {
  const [time, setTime] = useState(orangeChicken ? '16:00' : '11:00');
  const [food, setFood] = useState(orangeChicken ? 'Orange Chicken' : '');
  const [meal, setMeal] = useState(orangeChicken ? 'Dinner' : 'Breakfast');
  const [message, setMessage] = useState('$food ');
  const [locations, setLocations] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [open, setOpen] = useState(false);
  const [lastTestCall, setLastTestCall] = useState(null);
  // need to rate limit 'test' button every 30 seconds
  useEffect(() => {
    setMessage(`${food} at ${meal} in ${selectedLocations?.map((l) => l.shortName).join(',')}`);
  }, [food, meal, selectedLocations]);
  useEffect(async () => {
    const locationRef = query(collection(db, 'locations'));
    const locations = await getDocs(locationRef);
    const locationData = [];
    locations.forEach((location) => locationData.push(location.data()));
    console.log('Got these locations:', locationData);
    setLocations(locationData);
  }, []);

  const testAlert = async () => {
    const currentTime = new Date();
    console.log((currentTime - lastTestCall) / 1000);
    if (lastTestCall && (currentTime - lastTestCall) / 1000 < 30) {
      const timeDiff = 30 - Math.round((currentTime - lastTestCall) / 1000);
      snackbarShowMessage(
        `Being rate limited, please try again in ${timeDiff} second${timeDiff == 1 ? '' : 's'}`,
        'error',
        6000,
      );
      return;
    }

    setLastTestCall(currentTime);
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
    const [hours, minutes] = time.split(':').map((v) => parseInt(v));
    const timeAsRounded = hours + round30(minutes) / 60;
    const firebaseKey = uuidv4();
    const body = {
      food,
      phoneNumber,
      message,
      time: timeAsRounded,
      meal,
      locations: selectedLocations.map((l) => l.name),
    };

    await setDoc(doc(db, 'alerts', firebaseKey), body);
    addAlert({ firebaseKey, ...body });

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
      <Container maxWidth="md">
        <Styled.Box>
          <Typography>Alert me at</Typography>
          <TextField
            id="time"
            label="Time"
            value={time}
            type="time"
            defaultValue="07:30"
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{
              step: 60 * 30, // 30 min
            }}
            // sx={{ width: 150 }}
          />
        </Styled.Box>
        <Styled.Box>
          <Typography>when</Typography>
          <Button variant="outlined" onClick={() => setOpen(true)}>
            {food || 'Select Food'}
          </Button>
          <FoodSelect
            open={open}
            handleClose={() => setOpen(false)}
            onFoodSelect={(food) => setFood(food.name)}
          />
        </Styled.Box>
        <Styled.Box>
          <Typography>is available at</Typography>
          <FormControl>
            <Select
              options={['Breakfast', 'Lunch', 'Dinner'].map((m) => ({ value: m, label: m }))}
              label="meal"
              defaultValue={{ value: meal, label: meal }}
              onChange={handleMealChange}
            />
          </FormControl>
        </Styled.Box>
        <Styled.Box>
          <Typography>at </Typography>
          <FormControl>
            <Select
              options={locations.map((location) => ({
                value: location,
                label: location.shortName,
              }))}
              setValue={(e) => {
                console.log(e);
              }}
              onChange={handleLocationsChange}
              isMulti
            />
          </FormControl>
        </Styled.Box>
        <Styled.Box>
          <Typography>With this message</Typography>
          <TextField
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            variant="standard"
          ></TextField>
        </Styled.Box>
        <Styled.Box>
          <Styled.ButtonContainer>
            <Button
              variant="outlined"
              color="secondary"
              onClick={testAlert}
              sx={{ marginRight: '2em' }}
            >
              Test Alert*
            </Button>
            <Button variant="contained" color="primary" onClick={saveAlert}>
              Save Alert
            </Button>
          </Styled.ButtonContainer>
        </Styled.Box>
      </Container>
    </form>
  );
}

export default withSnackbar(AlertBuilder);
