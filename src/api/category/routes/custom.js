module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/last-categories',
      handler: 'category.getLastCategory',
      config: {
        auth: false,
      }
    }
    // ,
    // {
    //   method: 'GET',
    //   path: '/past-categories',
    //   handler: 'category.getPastCategories',
    //   config: {
    //     auth: false,
    //   }
    // }
  ]
}
