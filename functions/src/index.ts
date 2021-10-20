import * as functions from "firebase-functions";
import * as admin from "firebase-admin"
import axios from 'axios'
admin.initializeApp();
const db : FirebaseFirestore.Firestore = admin.firestore();

// import { doc, setDoc } from 'firebase/firestore';

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
// “At every 2nd minute.”
const apiURL = 'https://web.housing.illinois.edu/MobileAppWS/api';

const schedule = '/LocationSchedules';


interface DiningHall {
  DiningOptionID : number
  DiningOptionName: string
  Type: string
  DiningLocation: string
}

interface FoodItem {
  Category: string
  Course: string
  CourseSort: number
  DiningMenuID: number

  DiningOptionID: number

  EventDate: string
  EventDateGMT: number
  FormalName: string
  ItemID: number
  Meal: string
  ScheduleID: number
  ServingUnit: string
  Traits: string
}

interface FoodElement {
  name: string
  locations: string[]
}
const getFoodForDay = async (day: string) => {
  const response: any = await axios.get(apiURL + schedule);

  const diningOptionIDLookup: Record<number, string> = {};
  const promises: Promise<FoodItem[]>[] = response.data.DiningOptions.map((option: DiningHall) => {
  diningOptionIDLookup[option.DiningOptionID] = option.DiningOptionName;
  return axios
    .get(apiURL + `/Menu/${option.DiningOptionID}/${day}/`)
    .then((r) => r.data) as Promise<FoodItem[]>;
  });

  const mealMap: Record<string, string> = {
  'Kosher Dinner': 'Dinner',
  'Kosher Lunch': 'Lunch',
  'Hot Food Daily Menu': 'Daily',
  'Retail Offerings': 'Daily',
  'Field of Greens Daily Menu': 'Daily',
  'Daily Menu': 'Daily',
  'Light Lunch': 'Lunch',
  Lunch: 'Lunch',
  Dinner: 'Dinner',
  Breakfast: 'Breakfast',
  };
  const resultMap: Record<string, Record<string, FoodElement>> = { Breakfast: {}, Lunch: {}, Dinner: {}, Daily: {} };
  const foodItems: FoodItem[] = (await Promise.all(promises)).flatMap((x) => x)
  return foodItems
  .reduce(
    (map, item) => {
      const meal = mealMap[item.Meal];
      const cleanedName = item.FormalName.replace(/\//g, "")
      if (map[meal][cleanedName]) {
        map[meal][cleanedName].locations.push(diningOptionIDLookup[item.DiningOptionID]);
      } else {
        const newElem : FoodElement = {
          name: cleanedName,
          locations: [diningOptionIDLookup[item.DiningOptionID]],
          }
        map[meal][cleanedName] = newElem;
      }
      return map;
    },
    resultMap
  );
}

export const updateMenu = functions.pubsub.schedule('0 1 * * *')
.onRun(async context => {
  const d = new Date();
  const today: string = d.toLocaleDateString().replace(/\//g, "-");
  const meals = await getFoodForDay(today);
  const items: Promise<any>[] = []

  for (let [mealTime, mealTimeEntries] of Object.entries(meals)) {
    db.collection(`food/${today}/meals`).doc(mealTime).set({
      name: mealTime
    })

    for (let [item, value] of Object.entries(mealTimeEntries)) {
      items.push(db.collection(`food/${today}/meals/${mealTime}/items`).doc(item).set(value as FirebaseFirestore.DocumentData))
    }
  }
  console.log(`Waiting for ${items.length} Items `)
  await Promise.all(items);
})


// export const sendNotifications = functions.pubsub.schedule('0 2 * * *')
// .onRun(async context => {
  
//   const items = []
//   for (let [mealTime, mealTimeEntries] of Object.entries(meals)) {
//     for (let [item, value] of Object.entries(mealTimeEntries)) {
//       items.push(db.collection(`food/${today}/${mealTime}`).doc(item).set(value as FirebaseFirestore.DocumentData))
//     }
//   }
//   console.log(`Waiting for ${items.length} Items `)
//   await Promise.all(items);
// })