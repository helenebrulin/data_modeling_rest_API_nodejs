const redis = require('../../utils/redis_client');

const categoryIdCounter = "category:ctr";
const categoryIndex = "categories:idx";

const add = async (name) => {
  const client = redis.getClient();

  const id = await client.incrbyAsync(categoryIdCounter, 1);

  const key = await client.hsetAsync(categoryIndex, id, name);

  return key;
};


  module.exports = {
    add,
  };