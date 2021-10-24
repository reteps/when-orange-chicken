import React, { useState, useEffect } from 'react';
import { Container } from '@mui/material';
import AlertList from 'components/AlertList';
import AlertBuilder from 'components/AlertBuilder';
import styled from 'styled-components';
import { getAuth } from 'firebase/auth';
import { query, collection, getDocs, getDoc, doc, where, setDoc } from 'firebase/firestore';
import { db } from 'utils/firebase';

const Styled = {
  Container: styled(Container)`
    margin-top: 2em;
  `,
};
function AlertPage({ orangeChicken, ...props }) {
  const [alerts, setAlerts] = useState([]);
  const [phoneNumber, setPhoneNumber] = useState(null);

  useEffect(async () => {
    const auth = getAuth();

    console.log('AlertPage useEffect to get existing alerts & locations');
    const userDoc = await getDoc(doc(db, `users/${auth.currentUser.email}`));
    const phone = userDoc.data().phoneNumber;
    setPhoneNumber(phone);

    const userAlerts = await getDocs(
      query(collection(db, 'alerts'), where('phoneNumber', '==', phone)),
    );
    const data = [];
    userAlerts.forEach((alert) => data.push({ firebaseKey: alert.id, ...alert.data() }));
    console.log('Got these alerts:', data);
    setAlerts(data);
  }, []);

  return (
    <Styled.Container>
      {phoneNumber && (
        <AlertBuilder
          addAlert={(alert) => setAlerts([...alerts, alert])}
          phoneNumber={phoneNumber}
          orangeChicken={orangeChicken}
        />
      )}
      {<AlertList alerts={alerts} setAlerts={setAlerts} />}
    </Styled.Container>
  );
}
export default AlertPage;
