'use strict';

/**
 * question service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::question.question', ({ strapi }) => ({
  async find(...args) {
    const { results, pagination } = await super.find(...args)

    return { results, pagination };
  },
}));
