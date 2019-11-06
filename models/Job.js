const Sequelize = require('sequelize');

module.exports = async function (fastify) {
  fastify.db.define('Job', {
    title: Sequelize.STRING,
    location: Sequelize.STRING,
    type: Sequelize.STRING,
  });
}