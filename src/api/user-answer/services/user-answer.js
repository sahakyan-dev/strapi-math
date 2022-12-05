'use strict';

/**
 * user-answer service
 */

const { createCoreService } = require('@strapi/strapi').factories;

// module.exports = createCoreService('api::user-answer.user-answer')
module.exports = createCoreService('api::user-answer.user-answer', ({ strapi }) => ({
  async find(...args) {
    const { results, pagination } = await super.find(...args)

    return { results, pagination };
  },
}));
