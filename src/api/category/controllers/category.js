'use strict';

/**
 * category controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::category.category', ({ strapi }) => ({
  async getPastCategories(ctx) {
      try {
        const user = await strapi.plugins['users-permissions'].services.jwt.getToken(ctx);
        const categories = await strapi.db.query('api::category.category').findMany();
        return (await Promise.all(
          categories.map(async category => {
            let questionsCount = await strapi.db.query('api::question.question').count({
              where: {
                category: category.id
              }
            })

            let answersCount = await strapi.db.query('api::user-answer.user-answer').count({
              where: {
                users_permissions_user: user.id,
                category: category.id
              }
            })
            const keep = answersCount >= questionsCount && questionsCount !== 0;

            return { category, keep };
          })
        )).filter((data) => data.keep)
          .map((data) => data.category);

      } catch (err) {
        ctx.body = err;
      }
  },

  async getLastCategory(ctx) {
      try {
        const user = await strapi.plugins['users-permissions'].services.jwt.getToken(ctx);
        const args1 = {"filters":{"users_permissions_user":{"id":{"$eq": user.id}}},"pagination":{"limit":"1"},"sort":"createdAt:desc","populate":{"0":"question","question"
          :{"fields":"id","populate":"category"}}}
        const args = ctx.query = { ...args1, local: 'en' };
        const lastCategoryData  = await strapi.service('api::user-answer.user-answer').find(args);
        if (lastCategoryData.results.length) {
          const lastCategory = lastCategoryData.results[0].question.category;

          const args2 = {
            "filters": {
              "users_permissions_user": {
                "id": { "$eq": user.id }
              },
              "category": {
                "id": { "$eq": lastCategory.id }
              }
            },
            "local":"en"
          };

          const answersArgs = ctx.query = { ...args2, local: 'en' };
          const answers = await strapi.service('api::user-answer.user-answer').find(answersArgs);
          const answersCount = answers.pagination.total;

          const args3 = {
            "filters": {
              "category": {
                "id": { "$eq": lastCategory.id }
              }
            },
            "local":"en"
          };
          const questionsArgs = ctx.query = { ...args3, local: 'en' };
          const questions = await strapi.service('api::question.question').find(questionsArgs);
          const questionsCount = questions.pagination.total;

          if (questionsCount > answersCount) {
            return { lastCategory, totalQuestions: questionsCount, answeredQuestions: answersCount }
          }
        }

        return { lastCategory: null }
      } catch (err) {
        ctx.body = err;
      }
  },

  async find(ctx) {
    // some custom logic here
    ctx.query = { ...ctx.query, local: 'en' };
    // Calling the default core action
    const { data, meta } = await super.find(ctx);
    // some more custom logic
    meta.date = Date.now();

    return { data, meta };
  },
}));
