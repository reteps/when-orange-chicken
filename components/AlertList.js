import React from 'react';
import { List, ListItem, ListItemText, IconButton, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { db } from 'utils/firebase';
import { collection, deleteDoc, doc } from 'firebase/firestore';
function AlertList({ alerts, setAlerts, ...props }) {
  const deleteAlert = async (key) => {
    console.log(key);
    await deleteDoc(doc(db, 'alerts', key));
    setAlerts(alerts.filter((a) => a.firebaseKey != key));
  };

  return (
    <>
      {alerts.length > 0 && <Typography variant="h5"> Already Created Alerts </Typography>}
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
                {alert.food} - {alert.meal} - "{alert.message}"
              </ListItemText>
            </ListItem>
          );
        })}
      </List>
    </>
  );
}

export default AlertList;
