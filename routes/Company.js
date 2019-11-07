module.exports = async function (fastify, opts) {
  const { Company, SessionToken, User } = fastify.db.models;
  /*
      @URL /{version}/company/new
      @METHOD POST
      @String Name
      @String Details
      @SessionToken CompanyOwner
      >Return {Company}
  */
  fastify.post('/new', async (req, res) => {
    res.type('application/json').code(200);
    const { token, name } = req.body;
    const session = await SessionToken.findOne({ where: { token } });
    if (!session) return { status: 'error', message: 'Invalid Session' };
    const user = User.findOne({ where: { id: session.userId } });
    if (!user) return { status: 'error', message: 'Invalid Session' };
    const transaction = await fastify.db.transaction();
    const company = await Company.create({ name });
    if (!company) return { status: 'error', message: 'Failed to register' };
    await transaction.commit();
    user.addCompany(userSession);
    return { status: 'success', message: 'User Created', token };
  });
  /*
    @URL /{version}/company/{companyID}/info
    @METHOD GET
    @String CompanyIdentifier
    >Return {Company}
*/
  fastify.get('/:companyId/info', async (req, res) => {
    const { companyId } = req.params;
    const company = await Company.findOne({
      where: { companyId },
      include: [User],
    });
    if (!company) return { status: 'error', message: 'Failed to find company' };
    return company;
  });
  /*
    @URL /{version}/company/{companyID}/remove
    @METHOD POST
    @String CompanyIdentifier
    @SessionToken Requesting User
    >Return {Company}
*/
  fastify.post('/:companyId/remove', async (req, res) => {
    const { params: { companyId }, body: { token } } = req;
    const session = await SessionToken.findOne({ where: { token } });
    if (!session) return { status: 'error', message: 'Invalid Session' };
    const company = await Company.findOne({
      where: { companyId },
      include: [User],
    });
    if (!company) return { status: 'error', message: 'Failed to find company' };
    if (company.userId !== session.userId) return { status: 'error', message: 'User does not have permission.' };
    company.destroy();
    return { status: 'success', message: 'Removed Company' };
  });
  /*
      @URL /{version}/company/update
      @METHOD POST
      @String Name
      @String Details
      @SessionToken CompanyOwner
      >Return {Company}
  */
  fastify.post('/:companyId/update', async (req, res) => {
    res.type('application/json').code(200);
    const { token, name } = req.body;
    const session = await SessionToken.findOne({ where: { token } });
    if (!session) return { status: 'error', message: 'Invalid Session' };
    const transaction = await fastify.db.transaction();
    const company = Company.update({ name }, { where: companyId, userId: session.userId });
    await transaction.commit();
    if (!company) return { status: 'error', message: 'Failed to update company' };
    return { status: 'success', message: 'Company Updated', token };
  });
}