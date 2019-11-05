module.exports = async function (fastify, opts) {
  /*
      @URL /{version}/job/new
      @METHOD POST
      @String Postion Title
      @String Position Details
      @Company Listing Company
      >Return {JobObject}
  */
  fastify.post('/new', async (request, reply) => {
    return { hello: 'login' }
  });
  /*
    @URL /{version}/job/{jobID}/info
    @METHOD GET
    @String JobIdentifier
    >Return {JobObject}
*/
  fastify.get('/:jobID/info', async (request, reply) => {
    return { hello: 'login' }
  });
  //TODO: DOCUMENT/MAKE
  fastify.post('/:jobID/remove', async (request, reply) => {
    return { hello: 'login' }
  });
  //TODO: DOCUMENT/MAKE
  fastify.post('/:jobID/update', async (request, reply) => {
    return { hello: 'login' }
  });
}