const redis = require('redis');
const bluebird = require('bluebird');

// Promisify all the functions exported by node_redis.
bluebird.promisifyAll(redis);

const client = redis.createClient();

client.on('connect', function() {
    console.log('Connected!');
  });

client.on('error', error => console.log(error));

module.exports = {
  /**
   * Get the application's connected Redis client instance.
   *
   * @returns {Object} - a connected node_redis client instance.
   */
  getClient: () => client,
};