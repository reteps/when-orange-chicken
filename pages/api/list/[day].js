import axios from 'axios';
const apiURL = 'https://web.housing.illinois.edu/MobileAppWS/api';

const schedule = '/LocationSchedules';

export default async function handler(req, res) {
  console.log(req.query.day);
  const response = await axios.get(apiURL + schedule);

  const promises = response.data.DiningOptions.map((option) => {
    return axios
      .get(apiURL + `/Menu/${option.DiningOptionID}/${req.query.day}/`)
      .then((r) => r.data);
  });

  const data = (await Promise.all(promises)).flatMap((x) => x);

  res.status(200).json(data);
}
