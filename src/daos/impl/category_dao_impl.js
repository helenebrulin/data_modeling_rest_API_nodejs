const redis = require('../../utils/redis_client');

const categoryIdCounter = "categories:ctr";
const categoryIndex = "categories:idx";

const add = async (name) => {
  const client = redis.getClient();

  const id = await client.incrbyAsync(categoryIdCounter, 1);

  await client.hsetAsync(categoryIndex, id, name);

  return 0;
};


  module.exports = {
    add,
  };