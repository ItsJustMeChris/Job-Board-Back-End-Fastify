const bcrypt = require('bcryptjs');
const crypto = require('crypto');

async function generateToken() {
  try {
    const buffer = await new Promise((resolve, reject) => {
      crypto.randomBytes(256, (ex, buf) => {
        if (ex) {
          reject(ex);
        }
        resolve(buf);
      });
    });
    const token = crypto
      .createHash('sha1')
      .update(buffer)
      .digest('hex');
    return token;
  } catch (ex) {
    return 0;
  }
}

module.exports = async function (fastify, opts) {
  const { User, SessionToken } = fastify.db.models;

  /*
    @URL /{version}/auth/login
    @METHOD POST
    @String Email
    @String Password
    >Return {status: 'ok'} || {status: 'error', error: 'message'}
  */
  fastify.post('/login', async (req, res) => {
    res.type('application/json').code(200);
    const { ip, body: { email, password } } = req;
    const user = await User.findOne({ where: { email } });
    if (!user) return { status: 'error', message: 'Invalid Password' };
    const auth = await bcrypt.compare(password, user.password);
    if (!auth) return { status: 'error', message: 'Invalid Password' };
    res.transaction = await fastify.db.transaction();
    const token = await generateToken();
    if (token === 0) return { status: 'error', message: '1' };
    const userSession = await SessionToken.create({ token, ip, });
    await res.transaction.commit();
    user.addToken(userSession);
    return { status: 'success', message: 'Logged In', token, user: { name: user.name, id: user.id } };
  });
  /*
    @URL /{version}/auth/register
    @METHOD POST
    @String Email
    @String Name
    @String Password
    >Return {status: 'ok'} || {status: 'error', error: 'message'}
*/
  fastify.post('/register', async (req, res) => {
    res.type('application/json').code(200);
    const { ip, body: { email, password, name } } = req;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    res.transaction = await fastify.db.transaction();
    const user = await User.create({ email, password: hash, name });
    if (!user) return { status: 'error', message: 'Failed to register' };
    const token = await generateToken();
    const userSession = await SessionToken.create({ token, ip });
    if (!userSession) return { status: 'error', message: 'Failed to register' };
    await res.transaction.commit();
    user.addToken(userSession);
    return { status: 'success', message: 'User Created', token, user: { name: user.name, id: user.id } };
  });
  /*
    @URL /{version}/auth/logout
    @METHOD POST
    @String SessionKey
    >Return {status: 'ok'} || {status: 'error', error: 'message'}
*/
  fastify.post('/logout', async (req, res) => {
    res.type('application/json').code(200);
    const { token } = req.body;
    const session = await SessionToken.findOne({ where: { token } });
    if (!session) return { status: 'error', message: 'An Error Happens' };
    session.destroy();
    return { status: 'success', message: 'Logged Out' };
  });
}