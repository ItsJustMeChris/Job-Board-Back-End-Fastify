module.exports = async function (fastify, opts) {
  const { Job } = fastify.db.models;
  /*
    @URL /{version}/jobs/all[/page]
    @METHOD GET
    [@Number Page]
    >Return [{JobObject},{JobObject}]
*/
  fastify.get('/all/:page', async (req, res) => {
    res.type('application/json').code(200);
    const { page = 0 } = req.params;
    const jobs = await Job.findAll({
      limit: 50,
      offset: 50 * page,
      order: [['updatedAt', 'DESC']],
      include: [User],
    });
    if (!jobs) return { satus: 'error', message: 'Failed to fetch jobs.' };
    return jobs;
  });
  /*
    @URL /{version}/jobs/count
    @METHOD GET
    >Return Number TotalJobs
  */
  fastify.get('/count', async (req, res) => {
    const count = await Job.count();
    if (!count) return { status: 'error', message: 'Failed to get count' };
    return count;
  });
}