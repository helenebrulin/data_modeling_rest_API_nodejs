const categoryDao = require('../daos/category_dao');

 const add = async name => categoryDao.add(name);

module.exports = {add};