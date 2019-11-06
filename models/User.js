const Sequelize = require('sequelize');

module.exports = async function (fastify) {
  fastify.db.define('User', {
    name: Sequelize.STRING,
    email: { type: Sequelize.STRING, unique: true },
    password: Sequelize.STRING,
  });
  fastify.db.models.User.hasMany(fastify.db.models.SessionToken, { as: 'token' });
  fastify.db.models.SessionToken.belongsTo(fastify.db.models.User);
  fastify.db.models.User.hasMany(fastify.db.models.Company, { as: 'company' });
  fastify.db.models.Company.belongsTo(fastify.db.models.User);
}