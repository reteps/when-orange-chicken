import {
  Dialog,
  DialogContent,
  DialogTitle,
  ListItem,
  ListItemButton,
  ListItemText,
  Button,
  DialogActions,
  TextField,
  InputAdornment,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { FixedSizeList } from 'react-window';
import SearchIcon from '@mui/icons-material/Search';
import { db } from 'utils/firebase';
import { query, collectionGroup, getDocs } from 'firebase/firestore';
function FoodSelect({ open, handleClose, onFoodSelect }) {
  const [items, setItems] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [search, setSearch] = useState(null);
  const [filteredItems, setFilteredItems] = useState([]);

  useEffect(() => {
    setFilteredItems(items.filter((v) => search === null || v.name.match(new RegExp(search, 'i'))));
  }, [items, search]);
  useEffect(async () => {
    console.log('Running food items query');
    const today = new Date().toLocaleDateString().replaceAll('/', '-');
    const foodItems = query(collectionGroup(db, 'items'));
    const allFoodItems = await getDocs(foodItems);
    // const allFoodItems = [{ id: 'food1' }, { id: 'food2' }, { id: 'food3' }];
    const tempItems = {};
    allFoodItems.forEach((doc) => {
      const { locations, name } = doc.data();
      if (tempItems[name] !== undefined) {
        locations.forEach((l) => tempItems[name].add(l));
      } else {
        tempItems[name] = new Set(locations);
      }
    });
    const itemList = Object.entries(tempItems).map(([key, value]) => ({
      name: key,
      locations: value,
    }));
    console.log(itemList);
    setItems(itemList);
  }, []);

  const FoodItem = ({ index, style }) => {
    return (
      <ListItem style={style} key={index} component="div" disablePadding>
        <ListItemButton
          selected={selectedIndex == index}
          onClick={() => {
            console.log(index);
            setSelectedIndex(index);
          }}
        >
          <ListItemText primary={filteredItems[index].name} />
        </ListItemButton>
      </ListItem>
    );
  };
  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle> Select Food to get an alert for </DialogTitle>
      <DialogContent>
        <TextField
          sx={{ marginTop: '1em' }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          type="search"
          label="Search..."
        />
        <FixedSizeList
          itemSize={40}
          itemCount={filteredItems.length}
          overscanCount={5}
          height={400}
          width={360}
        >
          {FoodItem}
        </FixedSizeList>
      </DialogContent>
      <DialogActions>
        <Button
          variant="outlined"
          color="secondary"
          onClick={() => handleClose(true)}
          sx={{ marginRight: '2em' }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          disabled={selectedIndex === null}
          onClick={() => {
            onFoodSelect(filteredItems[selectedIndex]);
            handleClose(true);
          }}
        >
          Select
        </Button>
      </DialogActions>
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
