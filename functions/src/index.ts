import * as functions from "firebase-functions";
import * as admin from "firebase-admin"
import axios from 'axios'
import client, { fromNumber } from './twilio'

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

/*interface Alert {
  number: string
  meal: string
  food: string
  locations: string[]
  time: number
  text: string
}*/

const getFoodForDay = async (day: string) => {
  const response: any = await axios.get(apiURL + schedule);

  const diningOptionIDLookup: Record<number, string> = {};
  const promises: Promise<FoodItem[]>[] = response.data.DiningOptions.map((option: DiningHall) => {
    diningOptionIDLookup[option.DiningOptionID] = option.DiningOptionName.replace(/\//g, " ");
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
  const meals = foodItems
  .reduce(
    (map, item) => {
      const meal = mealMap[item.Meal];
      const cleanedName = item.FormalName.replace(/\//g, " ")
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

  return [meals, diningOptionIDLookup]
}

const sendMessageTwilio = (to : string, body : string) => {
  return client.messages.create({
    body,
    to,
    from: fromNumber
  })
}

export const sendMessage = functions.https.onRequest(async (req: any, res: any) => {
  if (!req.body.to || !req.body.body) {
    res.status(500).send('Error: req.body.to or req.body.body was not defined.')
    return
  }

  const response = await sendMessageTwilio(req.body.to, req.body.body)
  res.status(200).json(response)
});

export const updateMenu = functions.pubsub.schedule('0 1 * * *')
.onRun(async context => {
  const d = new Date();
  const today: string = d.toLocaleDateString().replace(/\//g, "-");
  const [meals, locations] = await getFoodForDay(today);
  const items: Promise<any>[] = []

  for (let [mealTime, mealTimeEntries] of Object.entries(meals)) {
    items.push(db.collection(`food/${today}/meals`).doc(mealTime).set({
      name: mealTime
    }))

    for (let [item, value] of Object.entries(mealTimeEntries)) {
      items.push(db.collection(`food/${today}/meals/${mealTime}/items`).doc(item).set(value as FirebaseFirestore.DocumentData))
    }
  }

  for (let [id, name] of Object.entries(locations)) {
    items.push(db.collection(`locations`).doc(name).set({
      id,
      name
    }))
  }
  console.log(`Waiting for ${items.length} Items `)
  await Promise.all(items);
})


const round30 = (x: number) => {
    return Math.round(x/30)*30;
}

export const sendNotifications = functions.pubsub.schedule('0 2 * * *').onRun(async context => {
  const d = new Date();
  const today: string = d.toLocaleDateString().replace(/\//g, "-");

  const timeAsRounded = d.getHours() + round30(d.getMinutes()) / 60
  const alerts = await db.collectionGroup('alerts').where('time', '==', timeAsRounded).get()
  const alertsToSend: Promise<any>[] = []

  alerts.forEach(async alert => {
    const alertData = alert.data();
    console.log(`Processing alert ${alert.id} which is looking for the food: ${alertData.food} at the meal: ${alertData.meal} at any of these locations: ${alertData.locations.join(',')}`)
    const alertPipeline = db.collection(`food/collectionGroup/${today}/meals/${alertData.meal}/items`).where('name', '==', alertData.food).where('locations', 'array-contains-any', alertData.locations).get().then(ref => {
      if (!ref.empty) {
        const match = ref.docs[0].data()
        const locationIntersection = alertData.locations.filter((value: string) => match.locations.includes(value))
        console.log(`Sending Alert to ${alertData.number} because ${alertData.food} is at ${alertData.meal} at these locations: ${locationIntersection.join(',')}`)
        return sendMessageTwilio('+1' + alertData.number, alertData.message)
      }
    })
    alertsToSend.push(alertPipeline)
  })

  console.log(`Sending out ${alertsToSend.length} items`)
  await Promise.all(alertsToSend)
})