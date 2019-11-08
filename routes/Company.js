module.exports = async function (fastify, opts) {
  const { Company, SessionToken, User } = fastify.db.models;
  const sanitizeHtml = require('sanitize-html');

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
    const { token, name, description, image } = req.body;
    const cleanDescription = sanitizeHtml(description, {
      allowedTags: ['h2', 'h1', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
        'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div',
        'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'iframe', 'img'],
    });
    const session = await SessionToken.findOne({ where: { token } });
    if (!session) return { status: 'error', message: 'Invalid Session Token' };
    const user = await User.findOne({ where: { id: session.UserId } });
    if (!user) return { status: 'error', message: 'Failed to find User' };
    const transaction = await fastify.db.transaction();
    const company = await Company.create({ name, description: cleanDescription, image });
    if (!company) return { status: 'error', message: 'Failed to create company' };
    await transaction.commit();
    user.addCompany(company);
    return company;
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
    >FailReturn {Company}
    >SuccessReturn []
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
    if (company.UserId !== session.UserId) return company;
    company.destroy();
    return [];
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
    const company = Company.update({ name }, { where: companyId, UserId: session.UserId });
    await transaction.commit();
    if (!company) return company;
    return company;
  });
}