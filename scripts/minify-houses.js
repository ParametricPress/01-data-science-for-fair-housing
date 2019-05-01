const fs = require('fs');
const houses = require('../data/atlanta-houses-points.json');


houses.features.forEach((feature) => {
  feature.properties = {
    eligible: feature.properties.eligible
  };
})

fs.writeFileSync('houses-small.json', JSON.stringify(houses));