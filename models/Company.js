const Sequelize = require('sequelize');

module.exports = async function (fastify) {
  fastify.db.define('Company', {
    name: Sequelize.STRING
  });
  fastify.db.models.Company.hasMany(fastify.db.models.Job, { as: 'job' });
  fastify.db.models.Job.belongsTo(fastify.db.models.Company);
}