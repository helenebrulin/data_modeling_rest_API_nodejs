const redis = require('../../utils/redis_client');

const productsIdCounter = "products:ctr";
const productKeyPrefix = "products";
const productsNameIndex = "products:name:idx";
const productsByCategory = "products:categ:idx";
const imagesIdCounter = "imgs:ctr";
const imagesKeyPrefix = "imgs";

const remap = async (hash, productImgKey) => {
    const client = redis.getClient();
    const remappedHash = { ...hash };
    const imgs = {};
  
    remappedHash.id = parseInt(hash.id, 10);
    remappedHash.price = parseInt(hash.price, 10);
    remappedHash.category = parseInt(hash.price, 10);

    const imgsIds = await client.smembersAsync(productImgKey);
    const imgsKeys = ('imgs:' + imgsIds.join(' imgs:')).split(' ');
    
    const blobs = await client.mgetAsync(imgsKeys);

    for (i = 0; i < imgsIds.length; i++) {
        imgs[`${imgsIds[i]}`] = blobs[i];
    }

    remappedHash.images = imgs;
  
    return remappedHash;
};

const add = async (product) => {
    const client = redis.getClient();

    const images = product.images.split(',');
    const productCopy = { ...product };
    delete productCopy.images;

    const productId = await client.incrbyAsync(productsIdCounter, 1);
    const productKey = `${productKeyPrefix}:${productId}`;
    const productImgKey = `${productKeyPrefix}:${productId}:${imagesKeyPrefix}`;

    const transaction = client.multi();

    transaction.hmsetAsync(productKey, productCopy);
    transaction.hsetAsync(productKey, 'id', productId);
    transaction.hsetAsync(productsNameIndex, product.name, productId);
    transaction.zaddAsync(productsByCategory, product.category, productId);

    await transaction.execAsync();

    for (i = 0; i < images.length; i++) {
        let imgId = await client.incrbyAsync(imagesIdCounter, 1);
        let imgKey = `${imagesKeyPrefix}:${imgId}`;
        transaction.setAsync(imgKey, images[i]);
        transaction.saddAsync(productImgKey, imgId);
    }

    await transaction.execAsync();

    return (0);
};


const findById = async (id) => {
    const client = redis.getClient();
    const productKey = `${productKeyPrefix}:${id}`;
    const productImgKey = `${productKeyPrefix}:${id}:${imagesKeyPrefix}`;
    
    const hash = await client.hgetallAsync(productKey);
    
    return (hash === null ? hash : remap(hash, productImgKey));
};

const update = async (id, product) => {
    const client = redis.getClient();
    const productKey = `${productKeyPrefix}:${id}`;

    await client.hmsetAsync(productKey, product);

    const transaction = client.multi();
    if (product.name) {
        const oldName = await client.hgetAsync(productKey, 'name');
        transaction.hdelAsync(productsNameIndex, oldName);
        transaction.hsetAsync(productsNameIndex, product.name, id);
        }
    if (product.category) {
        transaction.zaddAsync(productsByCategory, product.category, id);
    }

    await transaction.execAsync();
    
    return 0;
};

const deleteImage = async (imgId, productId) => {
    const client = redis.getClient();
    const productImgKey = `${productKeyPrefix}:${productId}:${imagesKeyPrefix}`;
    let imgKey = `${imagesKeyPrefix}:${imgId}`;

    const transaction = client.multi();

    transaction.sremAsync(productImgKey, imgId);
    transaction.del(imgKey);

    await transaction.execAsync();
    
    return (0);
};

const addImage = async (imgs, productId) => {
    const client = redis.getClient();
    const productImgKey = `${productKeyPrefix}:${productId}:${imagesKeyPrefix}`;

    const images = imgs.split(',');

    const transaction = client.multi();

    for (i = 0; i < images.length; i++) {
        let imgId = await client.incrbyAsync(imagesIdCounter, 1);
        let imgKey = `${imagesKeyPrefix}:${imgId}`;
        transaction.setAsync(imgKey, images[i]);
        transaction.saddAsync(productImgKey, imgId);
    }

    await transaction.execAsync();
    
    return (0);
};
    

const del = async (id) => {
    const client = redis.getClient();
    const key = `${productKeyPrefix}:${id}`;
    const productImgKey = `${productKeyPrefix}:${id}:${imagesKeyPrefix}`;
  
    const oldName = await client.hgetAsync(key, 'name'); //SECURE IN CASE IT DOES NOT EXIST

    const transaction = client.multi();

    transaction.hdelAsync(productsNameIndex, oldName);

    transaction.delAsync(key);

    transaction.zremAsync(productsByCategory, id);

    await transaction.execAsync();

    const imgsIds = await client.smembersAsync(productImgKey);
    const keys = [];
    for (i = 0; i < imgsIds.length; i++) {
        keys.push(`${imagesKeyPrefix}:${imgsIds[i]}`);
    }
    keys.push(productImgKey);
    await client.delAsync(keys);

    return (0);
};


const findByName = async (pattern) => {
    const client = redis.getClient();

    const res = [];
    let cursor = 0; 

    do {
        tmp = await client.hscanAsync(productsNameIndex, cursor, "MATCH", pattern);
        cursor = tmp[0];
        for (let i = 0; i < tmp[1].length; i++) {
            if (i % 2 != 0) {
                let product = await findById(tmp[1][i]);
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
    for (let i = 0; i < tmp.length; i++) {
        let product = await findById(tmp[i]);
        res.push(product);
    }

    return (res);
};

module.exports = {
    add,
    findById,
    update,
    deleteImage,
    addImage,
    del,
    findByName,
    findByCategory
  };