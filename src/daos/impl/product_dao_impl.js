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

    const key = await client.hmsetAsync(productKey, productCopy);
    await client.hsetAsync(productKey, 'id', productId);
    await client.hsetAsync(productsNameIndex, product.name, productId);
    await client.zaddAsync(productsByCategory, product.category, productId);

    for (i = 0; i < images.length; i++) {
        let imgId = await client.incrbyAsync(imagesIdCounter, 1);
        let imgKey = `${imagesKeyPrefix}:${imgId}`;
        await client.setAsync(imgKey, images[i]);
        await client.saddAsync(productImgKey, imgId);
    }

    return key;
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
    if (product.name) {
        const oldName = await client.hgetAsync(productKey, 'name');
        await client.hdelAsync(productsNameIndex, oldName);
        await client.hsetAsync(productsNameIndex, product.name, id);
        }
    if (product.category) {
        await client.zaddAsync(productsByCategory, product.category, id);
    }
    
    return 0;
};

const deleteImage = async (imgId, productId) => {
    const client = redis.getClient();
    const productImgKey = `${productKeyPrefix}:${productId}:${imagesKeyPrefix}`;
    let imgKey = `${imagesKeyPrefix}:${imgId}`;

    await client.sremAsync(productImgKey, imgId);
    await client.del(imgKey);
    
    return (0);
};

const addImage = async (imgs, productId) => {
    const client = redis.getClient();
    const productImgKey = `${productKeyPrefix}:${productId}:${imagesKeyPrefix}`;

    const images = imgs.split(',');

    for (i = 0; i < images.length; i++) {
        let imgId = await client.incrbyAsync(imagesIdCounter, 1);
        let imgKey = `${imagesKeyPrefix}:${imgId}`;
        await client.setAsync(imgKey, images[i]);
        await client.saddAsync(productImgKey, imgId);
    }
    
    return (0);
};
    

const del = async (id) => {
    const client = redis.getClient();
    const key = `${productKeyPrefix}:${id}`;
    const productImgKey = `${productKeyPrefix}:${id}:${imagesKeyPrefix}`;
  
    const oldName = await client.hgetAsync(key, 'name'); //SECURE IN CASE IT DOES NOT EXIST
    await client.hdelAsync(productsNameIndex, oldName);

    await client.delAsync(key);

    await client.zremAsync(productsByCategory, id);

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