import AlertPage from 'components/AlertPage';
import OnboardingPage from 'components/OnboardingPage';
import { getAuth } from 'firebase/auth';
// import getMenu from './utils/food';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { db } from 'utils/firebase';

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
