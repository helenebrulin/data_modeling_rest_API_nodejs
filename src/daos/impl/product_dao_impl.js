const redis = require('../../utils/redis_client');

const productIdCounter = "products:ctr";
const productKeyPrefix = "product";
const productsNameIndex = "products:name:idx";
const productsByCategory = "products:categ:idx";

const remap = (hash) => {
    const remappedHash = { ...hash };
  
    remappedHash.id = parseInt(hash.id, 10);
    remappedHash.price = parseInt(hash.price, 10);
    remappedHash.category = parseInt(hash.price, 10);
  
    return remappedHash;
};

const add = async (product) => {
    const client = redis.getClient();

    const id = await client.incrbyAsync(productIdCounter, 1);

    const key = `${productKeyPrefix}:${id}`;

    await client.hmsetAsync(key, product);
    await client.hsetAsync(key, 'id', id);
    await client.hsetAsync(productsNameIndex, product.name, id);
    await client.zaddAsync(productsByCategory, product.category, id);

    return key;
};

const findById = async (id) => {
    const client = redis.getClient();
    const key = `${productKeyPrefix}:${id}`;
    
    const hash = await client.hgetallAsync(key);
    
    return (hash === null ? hash : remap(hash));
};

const update = async (id, product) => {
    const client = redis.getClient();
    const key = `${productKeyPrefix}:${id}`;
      
    await client.hmsetAsync(key, product);
    if (product.name) {
        const oldName = await client.hgetAsync(key, 'name');
        await client.hdelAsync(productsNameIndex, oldName);
        await client.hsetAsync(productsNameIndex, product.name, id);
        }
    if (product.category) {
        await client.zaddAsync(productsByCategory, product.category, id);
    }
    return key;
};
    

const del = async (id) => {
    const client = redis.getClient();
    const key = `${productKeyPrefix}:${id}`;
  
    await client.del(key);
  
    return (0);
};


const findByName = async (pattern) => {
    const client = redis.getClient();

    const res = [];
    let cursor = 0; 

    do {
        tmp = await client.hscanAsync(productsNameIndex, cursor, "MATCH", pattern);
        cursor = tmp[0];
        for (i = 0; i < tmp[1].length; i++) {
            if (i % 2 != 0) {
                let product = await(findById(tmp[1][i]));
                res.push(product);
            }
        }
    } while (cursor != 0);
    return (res);
};


const findByCategory = async (categoryId) => {
    const client = redis.getClient();

    const res = [];

    let tmp = await client.zrangeAsync(productsByCategory, categoryId, categoryId, "BYSCORE");
    for (i = 0; i < tmp.length; i++) {
        let product = await(findById(tmp[i]));
        res.push(product);
    }

    return (res);
};

module.exports = {
    add,
    findById,
    update,
    del,
    findByName,
    findByCategory
  };