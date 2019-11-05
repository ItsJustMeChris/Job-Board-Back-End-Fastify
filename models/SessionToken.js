const Sequelize = require('sequelize');

module.exports = async function (fastify) {
  fastify.db.define('SessionToken', {
    token: { type: Sequelize.STRING, unique: true },
    ip: { type: Sequelize.STRING },
  });
}