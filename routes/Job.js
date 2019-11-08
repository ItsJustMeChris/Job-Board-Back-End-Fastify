module.exports = async function (fastify, opts) {
  const { Company, SessionToken, User, Job } = fastify.db.models;
  const sanitizeHtml = require('sanitize-html');

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
    const { body: { title, description, location, type, token, CompanyId } } = req;
    const cleanDescription = sanitizeHtml(description, {
      allowedTags: ['h2', 'h1', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
        'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div',
        'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'iframe', 'img'],
    });
    const session = await SessionToken.findOne({ where: { token } });
    if (!session) return { status: 'error', message: 'Invalid Session' };
    const company = await Company.findOne({ where: { id: CompanyId, UserId: session.UserId } });
    if (!company) return { status: 'error', message: 'Failed to create Job' };
    res.transaction = await fastify.db.transaction();
    const job = await Job.create({ title, description: cleanDescription, location, type });
    await res.transaction.commit();
    if (!job) return { status: 'error', message: 'Failed to create Job' };
    company.addJob(job);
    return job;
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
    if (job.company.UserId !== session.UserId) return { status: 'error', message: 'User does not have permission.' };
    job.destroy();
    return { status: 'success', message: 'Removed Company' };
  });
  //TODO: Update Route
  fastify.post('/:jobId/update', async (req, res) => {
    return { hello: 'login' }
  });
}