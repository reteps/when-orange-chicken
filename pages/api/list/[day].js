import axios from 'axios';
const apiURL = 'https://web.housing.illinois.edu/MobileAppWS/api';

const schedule = '/LocationSchedules';

export default async function handler(req, res) {
  console.log(req.query.day);
  const response = await axios.get(apiURL + schedule);

  const diningOptionIDLookup = {};
  const promises = response.data.DiningOptions.map((option) => {
    diningOptionIDLookup[option.DiningOptionID] = option.DiningOptionName;
    return axios
      .get(apiURL + `/Menu/${option.DiningOptionID}/${req.query.day}/`)
      .then((r) => r.data);
  });

  const mealMap = {
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
  const data = (await Promise.all(promises))
    .flatMap((x) => x)
    .reduce(
      (map, item) => {
        const meal = mealMap[item.Meal];
        if (map[meal][item.FormalName]) {
          map[meal][item.FormalName].locations.push(diningOptionIDLookup[item.DiningOptionID]);
        } else {
          map[meal][item.FormalName] = {
            locations: [diningOptionIDLookup[item.DiningOptionID]],
          };
        }
        return map;
      },
      { Breakfast: {}, Lunch: {}, Dinner: {}, Daily: {} },
    );

  res.status(200).json(data);
}
