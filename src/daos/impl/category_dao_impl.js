const redis = require('../../utils/redis_client');

const categoryIdCounter = "category:counter";
const categoryIndex = "categories:index";

/**
 * Insert a new category.
 *
 * @param {string} name - a product object.
 * @returns {Promise} - a Promise, resolving to the string value
 *   for the key of the product.
 */
 const add = async (name) => {
    const client = redis.getClient();

    const id = await client.incrbyAsync(categoryIdCounter, 1);

    //TRANSACTION
    const key = await client.hsetAsync(categoryIndex, id, name);

    return key;
  };


  module.exports = {
    add,
  };