// import './App.css';
import { useEffect, useState, forwardRef } from 'react';
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
import { IconButton, TextField, Toolbar, Typography } from '@mui/material';
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
import MuiAlert from '@mui/material/Alert';
import { Link, Container } from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';
import Box from '@mui/material/Box';
import MainApp from 'components/MainApp';
import CustomTheme from 'components/CustomTheme';
const Alert = forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const Styled = {
  Header: styled(Typography)`
    font-family: 'Comic Sans MS', 'Comic Sans';
    flex-grow: 1;
  `,
  Container: styled.div`
    height: 100vh;
    display: flex;
    flex-direction: column;
  `,
  SignInContainer: styled(Container)`
    display: flex;
    flex-grow: grow;
    height: 100%;
  `,
};
function App() {
  const auth = getAuth();
  const [authorized, setAuthorized] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(null);

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setSnackbarOpen(null);
  };
  const handleSignout = (e) => {
    return auth
      .signOut()
      .then(() => {
        console.log(auth.currentUser);
        setAuthorized(false);
      })
      .catch((e) => {
        console.error(e);
      });
    // auth.currentUser = null;
  };
  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        setAuthorized(true);
      } else {
        setAuthorized(false);
      }
    });
  });
  const handleOpenID = (e) => {
    console.log('Clicked');
    setPersistence(auth, browserLocalPersistence).then(async () => {
      try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        if (!user.email.includes('@illinois.edu')) {
          console.log();
          handleSignout().then(() => {
            setSnackbarOpen('That is not an illinois gmail, signing you out again.');
            setAuthorized(false);
          });
          return;
        } else {
          setAuthorized(true);
        }
      } catch (error) {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorMessage);
        setSnackbarOpen(errorMessage);
      }
    });
  };

  const SignIn = (
    <Styled.SignInContainer component="main" maxWidth="sm">
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        sx={{
          flexGrow: 1,
          height: '100%',
          flexDirection: 'column',
        }}
      >
        <Typography>
          When Orange Chicken is a project to send you text notification whenever dining halls have
          an item on the menu. For example, you could set up an alert to send "ORANGE CHICKEN!!!!"
          whenever the Ike dining hall has Orange Chicken for lunch or dinner. This project is
          completely open source and is viewable{' '}
          <Link href="https://github.com/reteps/when-orange-chicken" target="_blank" rel="noopener">
            here
          </Link>
          .
        </Typography>
        <Box sx={{ marginTop: '2em' }}>
          <Button onClick={handleOpenID} variant="outlined" startIcon={<GoogleIcon />} size="large">
            {' '}
            Sign in with Google@illinois{' '}
          </Button>
        </Box>
      </Box>
    </Styled.SignInContainer>
  );

  return (
    <Styled.Container className="App">
      <CustomTheme>
        <AppBar position="sticky">
          <Toolbar>
            <Styled.Header>When Orange Chicken??</Styled.Header>
            {authorized && (
              <Button onClick={handleSignout} color="inherit">
                {' '}
                Sign out{' '}
              </Button>
            )}
          </Toolbar>
        </AppBar>
        {authorized ? <MainApp /> : SignIn}
        <Snackbar
          open={snackbarOpen !== null}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
        >
          <Alert onClose={handleSnackbarClose} severity="error" sx={{ width: '100%' }}>
            {snackbarOpen}
          </Alert>
        </Snackbar>
      </CustomTheme>
    </Styled.Container>
  );
}

export default App;
