module.exports = async function (fastify, opts) {
  const { Company, SessionToken, User, Job } = fastify.db.models;
  /*
    @URL /{version}/job/new
    @METHOD POST
    @String Title
    @String Description
    @String Location
    @String Type
    @CompanyIdentifier Listing Company
    @SessionToken Posting User
    >Return {JobObject}
  */
  fastify.post('/new', async (req, res) => {
    res.type('application/json').code(200);
    const { body: { title, description, location, type, token, companyId } } = req;
    const session = await SessionToken.findOne({ where: { token } });
    if (!session) return { status: 'error', message: 'Invalid Session' };
    const company = await Company.findOne({ where: { companyId, userId: session.userId } });
    if (!company) return { status: 'error', message: 'Failed to create Job' };
    const transaction = await fastify.db.transaction();
    const job = Job.create({ title, description, location, type });
    await transaction.commit();
    if (!job) return { status: 'error', message: 'Failed to create Job' };
    company.addJob(job);
    return { status: 'success', message: 'Job Created', token };
  });
  /*
    @URL /{version}/job/{jobID}/info
    @METHOD GET
    @String JobIdentifier
    >Return {JobObject}
  */
  fastify.get('/:jobId/info', async (req, res) => {
    const { jobId } = req.params;
    const job = await Job.findOne({
      where: { jobId },
      include: [Company],
    });
    if (!job) return { status: 'error', message: 'Failed to find job' };
    return job;

  });
  /*
    @URL /{version}/job/{jobID}/remove
    @METHOD POST
    @String JobIdentifier
    @SessionToken Token
    >Return {JobObject}
  */
  fastify.post('/:jobId/remove', async (req, res) => {
    const { params: { jobId }, body: { token } } = req;
    const session = await SessionToken.findOne({ where: { token } });
    if (!session) return { status: 'error', message: 'Invalid Session' };
    const job = await Job.findOne({
      where: { jobId },
      include: [Company],
    });
    if (!job) return { status: 'error', message: 'Failed to find Job' };
    if (job.company.userId !== session.userId) return { status: 'error', message: 'User does not have permission.' };
    job.destroy();
    return { status: 'success', message: 'Removed Company' };
  });
  //TODO: Update Route
  fastify.post('/:jobId/update', async (req, res) => {
    return { hello: 'login' }
  });
}