import React from 'react';
import Button from '@mui/material/Button';
import { Container, IconButton, TextField, Toolbar, Typography } from '@mui/material';
import TimePicker from '@mui/lab/TimePicker';
import DateAdapter from '@mui/lab/AdapterDayjs';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import AppBar from '@mui/material/AppBar';
import { Snackbar } from '@mui/material';
import FoodSelect from 'components/FoodSelect';
import styled from 'styled-components';
import { useEffect, useState, forwardRef } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { useForm, useController } from 'react-hook-form';

const Styled = {
  ButtonContainer: styled(Container)`
    display: flex;
    flex-direction: row;
    justify-content: space-apart;
  `,
};
function AlertPage({ orangeChicken, ...props }) {
  const [value, setValue] = useState(new Date());
  const [food, setFood] = useState(orangeChicken ? 'Orange Chicken' : '');
  const [meal, setMeal] = useState(orangeChicken ? 'Dinner' : '');
  const [text, setText] = useState('$food ');
  const [locations, setLocations] = useState([]);
  const [open, setOpen] = useState(false);
  const handleTimePicker = (newValue) => {
    let getRoundedDate = (minutes, d) => {
      let ms = 1000 * 60 * minutes; // convert minutes to ms
      let roundedDate = new Date(Math.round(d.toDate().getTime() / ms) * ms);

      return roundedDate;
    };
    setValue(getRoundedDate(30, newValue));
  };

  useEffect(() => {
    console.log('AlertPage useEffect to get existing alerts');
  }, []);
  const handleChange = (event) => {
    setAge(event.target.value);
  };

  return (
    <>
      <div>
        {orangeChicken ? (
          <div> YOU HAVE SELECTED ORANGE CHICKEN </div>
        ) : (
          <div> YOU MAKE ME SAD :( </div>
        )}
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
        <Button variant="outlined" onClick={() => setOpen(true)}>
          {food || 'Select Food'}
        </Button>
        <FoodSelect open={open} handleClose={() => setOpen(false)} />
        is available at
        <FormControl>
          <InputLabel id="demo-simple-select-label">meal</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={meal}
            label="meal"
            onChange={handleChange}
          >
            <MenuItem value={'Breakfast'}>Breakfast</MenuItem>
            <MenuItem value={'Lunch'}>Lunch</MenuItem>
            <MenuItem value={'Dinner'}>Dinner</MenuItem>
          </Select>
        </FormControl>{' '}
        With this message
        <TextField
          value={`${food} is at ${meal} in ${locations.join('')}.`}
          variant="standard"
          // helperText="You can use the variables '$food' '$meal' '$locations'"
        ></TextField>
      </div>
      <div> Added alerts </div>
      <div>TODO for alERT IN ALERTS</div>
      <Styled.ButtonContainer>
        <Button variant="outlined" color="secondary">
          Test Alert*
        </Button>
        <Button variant="contained" color="primary">
          Save Alert
        </Button>
      </Styled.ButtonContainer>
      <form></form>
    </>
  );
}
export default AlertPage;
