module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/institutions/:placeId/courses',
      handler: 'institution.getCourses',
      config: {
        auth: false,
      }
    },
  ]
}
