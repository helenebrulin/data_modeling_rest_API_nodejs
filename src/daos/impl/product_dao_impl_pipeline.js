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
    remappedHash.category = parseInt(hash.category, 10);

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

    const pipeline = client.batch();

    pipeline.hmsetAsync(productKey, productCopy);
    pipeline.hsetAsync(productKey, 'id', productId);
    pipeline.hsetAsync(productsNameIndex, product.name, productId);
    pipeline.zaddAsync(productsByCategory, product.category, productId);

    await pipeline.execAsync();

    for (i = 0; i < images.length; i++) {
        let imgId = await client.incrbyAsync(imagesIdCounter, 1);
        let imgKey = `${imagesKeyPrefix}:${imgId}`;
        pipeline.setAsync(imgKey, images[i]);
        pipeline.saddAsync(productImgKey, imgId);
    }

    await pipeline.execAsync();

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

    const pipeline = client.batch();
    if (product.name) {
        const oldName = await client.hgetAsync(productKey, 'name');
        pipeline.hdelAsync(productsNameIndex, oldName);
        pipeline.hsetAsync(productsNameIndex, product.name, id);
        }
    if (product.category) {
        pipeline.zaddAsync(productsByCategory, product.category, id);
    }

    await pipeline.execAsync();
    
    return 0;
};

const deleteImage = async (imgId, productId) => {
    const client = redis.getClient();
    const productImgKey = `${productKeyPrefix}:${productId}:${imagesKeyPrefix}`;
    let imgKey = `${imagesKeyPrefix}:${imgId}`;

    const pipeline = client.batch();

    pipeline.sremAsync(productImgKey, imgId);
    pipeline.del(imgKey);

    await pipeline.execAsync();
    
    return (0);
};

const addImage = async (imgs, productId) => {
    const client = redis.getClient();
    const productImgKey = `${productKeyPrefix}:${productId}:${imagesKeyPrefix}`;

    const images = imgs.split(',');

    const pipeline = client.batch();

    for (i = 0; i < images.length; i++) {
        let imgId = await client.incrbyAsync(imagesIdCounter, 1);
        let imgKey = `${imagesKeyPrefix}:${imgId}`;
        pipeline.setAsync(imgKey, images[i]);
        pipeline.saddAsync(productImgKey, imgId);
    }

    await pipeline.execAsync();
    
    return (0);
};
    

const del = async (id) => {
    const client = redis.getClient();
    const key = `${productKeyPrefix}:${id}`;
    const productImgKey = `${productKeyPrefix}:${id}:${imagesKeyPrefix}`;
  
    const oldName = await client.hgetAsync(key, 'name'); //SECURE IN CASE IT DOES NOT EXIST

    const pipeline = client.batch();

    pipeline.hdelAsync(productsNameIndex, oldName);

    pipeline.delAsync(key);

    pipeline.zremAsync(productsByCategory, id);

    await pipeline.execAsync();

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

    let cursor = 0; 

    const pipeline = client.batch();

    do {
        tmp = await client.hscanAsync(productsNameIndex, cursor, "MATCH", pattern);
        cursor = tmp[0];
        for (let i = 0; i < tmp[1].length; i++) {
            if (i % 2 != 0) {
                let productKey = `${productKeyPrefix}:${tmp[1][i]}`;
                pipeline.hgetallAsync(productKey);
                
            }
        }
    } while (cursor != 0);

    const response = await pipeline.execAsync();

    const res = await parsePipelinedResponse(response);

    return (res);
};


const findByCategory = async (categoryId) => {
    const client = redis.getClient();

    let tmp = await client.zrangeAsync(productsByCategory, categoryId, categoryId, "BYSCORE");

    const pipeline = client.batch();
    for (let i = 0; i < tmp.length; i++) {
        let productKey = `${productKeyPrefix}:${tmp[i]}`;
        pipeline.hgetallAsync(productKey);
    }

    const response = await pipeline.execAsync();
    
    const res = await parsePipelinedResponse(response);

    return (res);
};

const parsePipelinedResponse = async (response) => {
    const res = [];

    for (let i = 0; i < response.length; i++) {
        let productImgKey = `${productKeyPrefix}:${response[i].id}:${imagesKeyPrefix}`;
        let tmp = await remap(response[i], productImgKey);
        res.push(tmp);
    }
    return res;
}

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