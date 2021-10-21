import React from 'react';
import Button from '@mui/material/Button';
import { Container, IconButton, TextField, Toolbar, Typography, ListItemText } from '@mui/material';
import TimePicker from '@mui/lab/TimePicker';
import DateAdapter from '@mui/lab/AdapterDayjs';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import AppBar from '@mui/material/AppBar';
import { Snackbar, List, ListItem } from '@mui/material';
import FoodSelect from 'components/FoodSelect';
import styled from 'styled-components';
import { useEffect, useState, forwardRef } from 'react';
import { doc, setDoc, getDocs, collection, query } from 'firebase/firestore';
import { useForm, useController } from 'react-hook-form';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { getAuth } from 'firebase/auth';
import { db } from 'utils/firebase';
import axios from 'axios';
const Styled = {
  ButtonContainer: styled(Container)`
    display: flex;
    flex-direction: row;
    justify-content: space-apart;
  `,
};
function AlertPage({ orangeChicken, ...props }) {
  const [time, setTime] = useState(new Date());
  const [food, setFood] = useState(orangeChicken ? 'Orange Chicken' : '');
  const [meal, setmeal] = useState(orangeChicken ? 'Dinner' : '');
  const [message, setMessage] = useState('$food ');
  const [locations, setLocations] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [open, setOpen] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const handleTimePicker = (newValue) => {
    let getRoundedDate = (minutes, d) => {
      let ms = 1000 * 60 * minutes; // convert minutes to ms
      let roundedDate = new Date(Math.round(d.toDate().getTime() / ms) * ms);

      return roundedDate;
    };
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

    const auth = getAuth();

    console.log('AlertPage useEffect to get existing alerts & locations');
    const userRef = query(collection(db, `users/${auth.currentUser.email}/alerts`));
    const userAlerts = await getDocs(userRef);
    const data = [];
    userAlerts.forEach((alert) => data.push(alert.data()));
    console.log('Got these alerts:', data);
    setAlerts(data);
  }, []);

  const testAlert = async () => {
    const body = {
      to: '+17348814354',
      body: 'Test alert',
    };

    console.log(`Sending body: ${JSON.stringify(body)}`);

    // TODO rate limit
    // await axios.post('https://us-central1-when-orange-chicken.cloudfunctions.net/sendMessage');
  };
  const round30 = (x) => {
    return Math.round(x / 30) * 30;
  };
  const saveAlert = async () => {
    const timeAsRounded = time.getHours() + round30(time.getMinutes()) / 60;

    const body = {
      food,
      message,
      time: timeAsRounded,
      meal,
      locations: selectedLocations,
    };

    setAlerts([...alerts, body]);
    console.log(body);
  };
  const handlemealChange = (event) => {
    setmeal(event.target.value);
  };

  const handleLocationsChange = (event) => {
    setSelectedLocations(event.target.value);
  };

  return (
    <>
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
          <InputLabel id="demo-simple-select-label">meal</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            value={meal}
            label="meal"
            onChange={handlemealChange}
          >
            <MenuItem value={'Breakfast'}>Breakfast</MenuItem>
            <MenuItem value={'Lunch'}>Lunch</MenuItem>
            <MenuItem value={'Dinner'}>Dinner</MenuItem>
          </Select>
        </FormControl>
        at{' '}
        <FormControl>
          <InputLabel id="location-label">these locations</InputLabel>
          <Select
            value={selectedLocations}
            onChange={handleLocationsChange}
            labelId="location-label"
            multiple
          >
            {locations.map((location) => {
              return (
                <MenuItem value={location.name} key={location.name}>
                  {location.name}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
        these locations. With this message
        <TextField
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          variant="standard"
          // helperText="You can use the variables '$food' '$meal' '$locations'"
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
      {alerts.length > 0 && <Typography> Already Created Alerts </Typography>}
      <List>
        {alerts.map((alert) => {
          return (
            <ListItem
              secondaryAction={
                <div>
                  {/* <IconButton>
                    <EditIcon />
                  </IconButton> */}
                  <IconButton onClick={deleteAlert}>
                    <DeleteIcon />
                  </IconButton>
                </div>
              }
            >
              <ListItemText>
                {alert.food} - {alert.meal} - {alert.locations.join(',')}
              </ListItemText>
            </ListItem>
          );
        })}
      </List>
    </>
  );
}
export default AlertPage;
