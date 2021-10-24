import React from 'react';
import { useState } from 'react';
import { Container } from '@mui/material';
import AlertList from 'components/AlertList';
import AlertBuilder from 'components/AlertBuilder';
import styled from 'styled-components';
const Styled = {
  Container: styled(Container)`
    margin-top: 2em;
  `,
};
function AlertPage({ orangeChicken, ...props }) {
  const [alerts, setAlerts] = useState([]);

  return (
    <Styled.Container>
      {<AlertBuilder setAlerts={setAlerts} orangeChicken={orangeChicken} />}
      {<AlertList alerts={alerts} setAlerts={setAlerts} />}
    </Styled.Container>
  );
}
export default AlertPage;
