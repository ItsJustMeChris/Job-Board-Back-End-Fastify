const fs = require('fs');
let fastify;
if (process.env.production) {
  fastify = require('fastify')({
    logger: true,
    https: {
      key: fs.readFileSync('/etc/letsencrypt/live/itsjustmechris.tech/privkey.pem'),
      cert: fs.readFileSync('/etc/letsencrypt/live/itsjustmechris.tech/fullchain.pem'),
      ca: fs.readFileSync('/etc/letsencrypt/live/itsjustmechris.tech/chain.pem')
    }
  });
} else {
  fastify = require('fastify')({
    logger: true,
  });
}

const fastifySequelize = require('fastify-sequelize');

fastify.register(fastifySequelize, {
  host: 'localhost',
  username: 'dev',
  database: 'job-board',
  password: 'dev',
  dialect: 'postgres',
  instance: 'db',
  autoConnect: true,
});
fastify.register(require('fastify-cors'), { origin: '*' });


fastify.register(require('./models/Job'));
fastify.register(require('./models/Company'));
fastify.register(require('./models/SessionToken'));
fastify.register(require('./models/User'));

fastify.register(require('./routes/Auth'), { prefix: '/v1/auth' });
fastify.register(require('./routes/Job'), { prefix: '/v1/job' });
fastify.register(require('./routes/Jobs'), { prefix: '/v1/jobs' });
fastify.register(require('./routes/Company'), { prefix: '/v1/company' });
fastify.register(require('./routes/Companies'), { prefix: '/v1/companies' });

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
    await fastify.listen(process.env.port);
    fastify.log.info(`server listening on ${fastify.server.address().port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}
start();