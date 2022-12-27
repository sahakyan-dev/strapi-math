module.exports = (plugin) => {
  // getting points controller
  plugin.controllers.user.getPoints = async (ctx) => {
    const { filters, sort, pagination } = ctx.request.query;

    return await strapi.entityService.findPage(
      'plugin::users-permissions.user',
      {
        ...(filters && {filters}),
        sort,
        page: pagination.page,
        pageSize: pagination.pageSize
      }
    );
  };

  // extending of user's update() method - adding of saving course/class
  plugin.controllers.user['update'] = async (ctx) => {
    const data = ctx.request.body;
    let institutionId;
    let courseName = data.course.replaceAll(' ', '').toLowerCase();

    // adding of relation to the Institution model
    if (data.institution.name && data.institution.place_id) {
      const institutions = await strapi.entityService.findMany('api::institution.institution');
      const institutionItem = institutions.find(item => item.place_id === data.institution.place_id);

      if (!institutionItem) {
        const entry = await strapi.entityService.create('api::institution.institution', {
          data: {
            name: data.institution.name,
            place_id: data.institution.place_id
          }
        });

        institutionId = entry.id;
      } else {
        institutionId = institutionItem.id
      }
    }

    // adding of course to institution
    if (courseName) {
      const institutionEntry = await strapi.entityService.findOne('api::institution.institution', institutionId);

      if (!institutionEntry.courses || !institutionEntry.courses.includes(courseName)) {
        await strapi.entityService.update(
          'api::institution.institution',
          institutionId,
          {
            data: {
              courses: institutionEntry.courses ? [...institutionEntry.courses, courseName] : [courseName]
            }
          })
      }
    }

    return await strapi.entityService.update(
      'plugin::users-permissions.user',
      ctx.params.id,
      {
        data: {
          ...data,
          institution: institutionId,
          course: courseName
        },
        populate: ['institution']
      }
    );
  }

  plugin.routes['content-api'].routes.push({
    method: 'GET',
    path: '/get-points',
    handler: 'user.getPoints',
    config: {
      prefix: ''
    }
  })

  return plugin;
};
