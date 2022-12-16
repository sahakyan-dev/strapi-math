module.exports = (plugin) => {
  plugin.controllers.user.getPoints = async (ctx) => {
    const { filters, sort, pagination } = ctx.request.query;

    const result = await strapi.entityService.findPage(
      'plugin::users-permissions.user',
      {
        ...(filters && { filters }),
        sort,
        page: pagination.page,
        pageSize: pagination.pageSize
      }
    );

    return result;
  };

  plugin.routes['content-api'].routes.push({
    method: 'GET',
    path: '/user/get-points',
    handler: 'user.getPoints',
    config: {
      prefix: ''
    }
  })

  return plugin;
};
