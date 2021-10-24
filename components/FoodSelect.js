import { Dialog, DialogTitle, ListItem, ListItemButton, ListItemText } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { FixedSizeList } from 'react-window';

function FoodSelect({ open, handleClose }) {
  const [items, setItems] = useState([]);
  useEffect(async () => {
    console.log('Running food items query');
    const today = new Date().toLocaleDateString().replaceAll('/', '-');
    // const foodItems = query(collectionGroup(db, 'items'));
    // const allFoodItems = await getDocs(foodItems);
    const allFoodItems = [{ id: 'food1' }, { id: 'food2' }, { id: 'food3' }];
    const tempItems = new Set();
    allFoodItems.forEach((doc) => {
      for (var i = 0; i < 30; i++) {
        tempItems.add(i.toString());
      }
      // console.log(doc.id, ' => ', doc.data());
    });
    setItems([...tempItems]);
  }, []);

  const FoodItem = ({ index, style }) => {
    return (
      <ListItem style={style} key={index} component="div" disablePadding>
        <ListItemButton>
          <ListItemText primary={items[index]} />
        </ListItemButton>
      </ListItem>
    );
  };
  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle> Select Food to get an alert for </DialogTitle>
      <FixedSizeList
        itemSize={40}
        itemCount={items.length}
        overscanCount={5}
        height={400}
        width={360}
      >
        {FoodItem}
      </FixedSizeList>
    </Dialog>
    // <Select
    //   labelId="demo-simple-select-label"
    //   id="demo-simple-select"
    //   value={items}
    //   label="Select Food Items"
    //   onChange={(e) => setItems(e.target.value)}
    //   multiple
    // >
    //   {items.map((item) => {
    //     return <MenuItem value={item}>{item}</MenuItem>;
    //   })}
    // </Select>
  );
}

export default FoodSelect;
