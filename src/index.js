'use strict';

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap(/*{ strapi }*/) {
    const data = require('fs').readFileSync('./database/seeds/index.json', 'utf-8');
    const seedData = JSON.parse(data);

    Object.keys(seedData).forEach(entryKey => {
      const entryArrayData = Object.assign([], seedData[entryKey]);
      entryArrayData.shift();
      entryArrayData.forEach(async entry => {
        let check = await strapi.services[entryKey].findOne(entry.id)

        if (!check) {
          strapi.services[entryKey].create({data: entry});
        }
      })
    })
  },
};
