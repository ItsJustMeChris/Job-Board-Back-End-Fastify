module.exports = async function (fastify, opts) {
  /*
    @URL /{version}/jobs/all[/page]
    @METHOD GET
    [@Number Page]
    >Return [{JobObject},{JobObject}]
*/
  fastify.get('/all/:page', async (request, reply) => {
    return { hello: 'login' }
  });
  /*
  @URL /{version}/jobs/count
  @METHOD GET
  >Return Number TotalJobs
*/
  fastify.get('/count', async (request, reply) => {
    return { hello: 'login' }
  });
}