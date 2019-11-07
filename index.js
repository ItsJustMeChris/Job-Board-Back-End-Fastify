const fastify = require('fastify')({ logger: true });
const fastifySequelize = require('fastify-sequelize');

const DETAILED_LOGGING = true;

fastify.register(fastifySequelize, {
  host: 'localhost',
  username: 'dev',
  database: 'job-board',
  password: 'dev',
  dialect: 'postgres',
  instance: 'db',
  autoConnect: true,
});

fastify.register(require('./models/Job'));
fastify.register(require('./models/Company'));
fastify.register(require('./models/SessionToken'));
fastify.register(require('./models/User'));

fastify.register(require('./routes/Auth'), { prefix: '/v1/auth' });
fastify.register(require('./routes/Job'), { prefix: '/v1/job' });
fastify.register(require('./routes/Jobs'), { prefix: '/v1/jobs' });
fastify.register(require('./routes/Company'), { prefix: '/v1/company' });

fastify.setErrorHandler(function (error, req, res) {
  if (error.errors[0].message === 'email must be unique') return res.type('application/json').code(409).send({ status: 'error', message: 'Email already in use.' });
  fastify.log.error(error);
  return res.type('application/json').code(500).send({ status: 'error', message: 'Server encountered an error.' });
})

const start = async () => {
  try {
    await fastify.ready();
    await fastify.db.authenticate();
    await fastify.db.sync();
    await fastify.listen(3000);
    fastify.log.info(`server listening on ${fastify.server.address().port}`);

    console.log(`Test Register should return {status: 'success'}`);
    console.log(`Test Login should return {status: 'success'}`);
    console.log(`Test Company should return {Company}`);

    const testRegister = await fastify.inject({ method: 'POST', url: '/v1/auth/register', payload: { email: '1234qwer', password: 'qwer1234' } });
    const testLogin = await fastify.inject({ method: 'POST', url: '/v1/auth/login', payload: { email: '1234qwer', password: 'qwer1234' } });
    const testCompany = await fastify.inject({ method: 'POST', url: '/v1/company/new', payload: { name: 'Test2', token: JSON.parse(testLogin.body).token } });

    console.log(`Test Register Result: ${JSON.parse(testRegister.body).status}, ${JSON.parse(testRegister.body).message}`);
    console.log(`Test Login Result: ${JSON.parse(testLogin.body).status}, ${JSON.parse(testLogin.body).message}`);
    console.log(`Test Company Result: ${testCompany.body}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}
start();