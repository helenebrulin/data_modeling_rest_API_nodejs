const impl = require('./impl/category_dao_impl');

module.exports = {
    /**
     * Insert a product site.
     *
     * @param {string} name - a product object.
     * @returns {Promise}
     */
    add: async name => impl.add(name),
  
  };