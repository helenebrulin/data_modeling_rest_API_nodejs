/**
Change as needed :
**/

const impl = require('./impl/product_dao_impl');
//const impl = require('./impl/product_dao_impl_pipeline');
//const impl = require('./impl/product_dao_impl_transaction');

module.exports = {
    add: async product => impl.add(product),
  
    findAll: async () => impl.findByName('*'),

    findById: async id => impl.findById(id),

    update: async (id, product) => impl.update(id, product),

    deleteImage: async (imgId, productId) => impl.deleteImage(imgId, productId),

    addImage: async (images, productId) => impl.addImage(images, productId),

    del: async id => impl.del(id),

    findByName: async pattern => impl.findByName(pattern),

    findByCategory: async categoryId => impl.findByCategory(categoryId),
  
  };