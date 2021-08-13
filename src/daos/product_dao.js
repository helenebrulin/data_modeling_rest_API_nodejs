const impl = require('./impl/product_dao_impl');

module.exports = {
    add: async product => impl.add(product),
  
    findById: async id => impl.findById(id),

    update: async (id, product) => impl.update(id, product),

    del: async id => impl.del(id),

    findByName: async pattern => impl.findByName(pattern),

    findByCategory: async categoryId => impl.findByCategory(categoryId),
  
  };