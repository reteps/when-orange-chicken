import React from 'react';
import { IconButton, ListItemText } from '@mui/material';
import { List, ListItem } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

function AlertList({ alerts, setAlerts, ...props }) {
  const deleteAlert = async (key) => {
    await db.collection('alerts').doc(key).delete();
    setAlerts(alerts.filter((a) => a.firebaseKey != key));
  };
  return (
    <>
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
                  <IconButton onClick={() => deleteAlert(alert.firebaseKey)}>
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

export default AlertList;
