const productDao = require('../daos/product_dao');

const add = async product => productDao.add(product);

const findById = async id => productDao.findById(id);

const update = async (id, product) => productDao.update(id, product);

const deleteImage = async (imgId, productId) => productDao.deleteImage(imgId, productId);

const addImage = async (images, productId) => productDao.addImage(images, productId);

const del = async id => productDao.del(id);

const findByName = async pattern => productDao.findByName(pattern);

const findByCategory = async categoryID => productDao.findByCategory(categoryID);

module.exports = {add, findById, update, deleteImage, addImage, del, findByName, findByCategory};