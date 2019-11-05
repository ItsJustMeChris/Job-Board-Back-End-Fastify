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
      @URL /{version}/auth/user/login
      @METHOD POST
      @String Email
      @String Password
      >Return {status: 'ok'} || {status: 'error', error: 'message'}
  */
  fastify.post('/login', async (req, res) => {
    res.type('application/json').code(200);
    const { email, password } = req.body;
    const user = await User.findOne({
      where: { email },
    });
    if (user) {
      const auth = await bcrypt.compare(password, user.password);
      if (!auth) return { status: 'error', message: 'Invalid Password' };
      let transaction = await fastify.db.transaction();
      const token = await generateToken();
      if (token === 0) return { status: 'error', message: '1' };
      const { ip } = req;
      const userSession = await SessionToken.create({
        token,
        ip,
      });
      await transaction.commit();
      user.addToken(userSession);
      return { status: 'success', message: 'Logged In', token };
    } else {
      return { status: 'error', message: 'Invalid Password' };
    }
  });
  /*
    @URL /{version}/auth/user/register
    @METHOD POST
    @String Email
    @String Name
    @String Password
    >Return {status: 'ok'} || {status: 'error', error: 'message'}
*/
  fastify.post('/register', async (req, res) => {
    res.type('application/json').code(200);
    const {
      email,
      password,
    } = req.body;
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    let transaction = await fastify.db.transaction();
    const user = await User.create({ email, password: hash });
    if (!user) return { status: 'error', message: 'Failed to register' };
    const token = await generateToken();
    const { ip } = req;
    const userSession = await SessionToken.create({ token, ip });
    if (!userSession) return { status: 'error', message: 'Failed to register' };
    await transaction.commit();
    user.addToken(userSession);
    return { status: 'success', message: 'User Created', token };
  });
  /*
    @URL /{version}/auth/user/logout
    @METHOD POST
    @String SessionKey
    >Return {status: 'ok'} || {status: 'error', error: 'message'}
*/
  fastify.post('/logout', async (request, reply) => {
    return { hello: 'login' }
  });
}