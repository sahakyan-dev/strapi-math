'use strict';

/**
 * institution controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::institution.institution', ({ strapi }) => ({
  async getCourses(ctx) {
    try {
      const institution = await strapi.db.query('api::institution.institution')
        .findOne({
          where: {
            place_id: {
              $eq: ctx.params.placeId,
            },
          },
        });

      if (!institution || !institution.courses.length) return [];

      return { courses: institution.courses }
    } catch (err) {
      ctx.body = err;
    }
  }
}));
