import React from 'react';
import { useEffect, useState, forwardRef } from 'react';
import axios from 'axios';
import { db } from 'utils/firebase';
// import getMenu from './utils/food';
import { doc, setDoc, getDoc } from 'firebase/firestore';

import OnboardingPage from 'components/OnboardingPage';
import AlertPage from 'components/AlertPage';
import {
  getAuth,
  // GoogleAuthProvider,
} from 'firebase/auth';
function MainApp() {
  const [orangeChicken, setOrangeChicken] = useState(false);
  const auth = getAuth();

  const [completedOnboarding, setCompletedOnboarding] = useState(false);
  // const
  useEffect(async () => {
    console.log('UseEffect MainApp hook');
    if (!completedOnboarding) {
      console.log('A fetch to firebase');
      const user = await getDoc(doc(db, 'users', auth.currentUser.email));

      if (user.exists()) {
        setCompletedOnboarding(true);
      }
    }
  });

  return completedOnboarding ? (
    <AlertPage orangeChicken={orangeChicken} />
  ) : (
    <OnboardingPage
      setOrangeChicken={setOrangeChicken}
      setCompletedOnboarding={setCompletedOnboarding}
    />
  );
}

export default MainApp;
