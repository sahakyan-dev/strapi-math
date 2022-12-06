module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/answered-questions',
      handler: 'question.getAnsweredQuestions',
      config: {
        auth: false,
      }
    }
  ]
}
