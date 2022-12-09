'use strict';

/**
 * user-answer controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::user-answer.user-answer', ({ strapi }) => ({
  // Method 2: Wrapping a core action (leaves core logic in place)
  async find(ctx) {
    // some custom logic here
    ctx.query = { ...ctx.query, local: 'en' };
    // Calling the default core action
    const { data, meta } = await super.find(ctx);
    // some more custom logic
    meta.date = Date.now();

    return { data, meta };
  },

  // Method 3: Replacing a core action
  async findOne(ctx) {
    const { id } = ctx.params;
    const { query } = ctx;

    const entity = await strapi.service('api::question.question').findOne(id, query);
    const sanitizedEntity = await this.sanitizeOutput(entity, ctx);

    return this.transformResponse(sanitizedEntity);
  },

  async create(ctx) {
    // some logic here
    const response = await super.create(ctx);
    const user = ctx.state.user;
    const {id, points} = user;
    const statusesObj = {
      correct: 3,
      wrong: -2,
      skipped: -1,
    };
    const newPoints = points + statusesObj[response.data.attributes.status];

    // update user's points on answer creation
    await strapi.service('plugin::users-permissions.user').edit(id, { points: newPoints });

    return response;
  }
}));
