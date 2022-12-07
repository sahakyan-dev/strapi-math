'use strict';

/**
 * question controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::question.question', ({ strapi }) => ({
  async getAnsweredQuestions(ctx) {
    try {
      const user = await strapi.plugins['users-permissions'].services.jwt.getToken(ctx);
      const args = ctx.query = {
        populate: 'question',
        filters: {
          users_permissions_user: {
            id: { $eq: user.id }
          }
        },
        local: 'en'
      };

      const userAnswersData  = await strapi.service('api::user-answer.user-answer').find(args);
      const result = userAnswersData?.pagination?.total;

      return { result }
    } catch (err) {
      ctx.body = err;
    }
  },

  // Method 2: Wrapping a core action (leaves core logic in place)
  async find(ctx) {
    // some custom logic here
    ctx.query = { ...ctx.query, local: 'en' };
    if (ctx.query?.filters?.id && ctx.query?.filters?.id?.$notIn) {
      ctx.query.filters.id.$notIn = ctx.query.filters.id.$notIn.split(',')
    }
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
}));
