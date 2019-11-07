module.exports = async function (fastify, opts) {
  const { Company } = fastify.db.models;
  /*
    @URL /{version}/companies/all[/page]
    @METHOD GET
    [@Number Page]
    >Return [{JobObject},{JobObject}]
*/
  fastify.get('/all/:page', async (req, res) => {
    res.type('application/json').code(200);
    const { page = 0 } = req.params;
    const companies = await Company.findAll({
      limit: 50,
      offset: 50 * page,
      order: [['updatedAt', 'DESC']],
    });
    if (!companies) return { satus: 'error', message: 'Failed to fetch companies.' };
    return companies;
  });
  /*
    @URL /{version}/companies/count
    @METHOD GET
    >Return Number Totalcompanies
  */
  fastify.get('/count', async (req, res) => {
    const count = await Company.count();
    if (!count) return { count: 0 };
    return { count };
  });
}