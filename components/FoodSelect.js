import React, { useEffect, useState } from 'react';
import { db } from '../utils/firebase';
import { doc, getDoc, collectionGroup, query, getDocs } from 'firebase/firestore';
import { Select, MenuItem } from '@mui/material';
function FoodSelect() {
  const [items, setItems] = useState([]);
  useEffect(async () => {
    const today = new Date().toLocaleDateString().replaceAll('/', '-');
    // const foodRef =
    // const myCollection = query(collection(db, `food/Breakfast/${today}`));
    // const documents = await getDocs(myCollection);
    // documents.forEach((doc) => {
    //   console.log(doc.id);
    // });
  });
  return (
    <Select
      labelId="demo-simple-select-label"
      id="demo-simple-select"
      value={items}
      label="Select Food Items"
      onChange={(e) => setItems(e.target.value)}
      multiple
    >
      {items.map((item) => {
        return <MenuItem value={item}>{item}</MenuItem>;
      })}
    </Select>
  );
}

export default FoodSelect;
