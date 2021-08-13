# data_modeling_rest_API_nodejs

<b><u>usage:</u></b>
- Change product_dao.js to use different daos implementations : normal - w. pipelines - w. transactions
- Start with "node app.js".

<b><u>Routes:</u></b>
- POST http://localhost:3000/product w. JSON body : add a product. Images BLOBs must be in a string separated by commas. No ids, for product or images, should be provided.
```json
{
    "name": "telephone2",
    "description": "fast",
    "vendor": "nokia",
    "price": "100",
    "currency": "euro",
    "category": "0",
    "images": "848016608498FE15C6050001000006020007002E000005E84501960844CFF,15C6050001000006020008002E000405E84,E15C6050001000006350800020000002E00010000"
}
```
- GET http://localhost:3000/product/:id : get product by ID
- PUT http://localhost:3000/product/:id : update product (without images). All fields are optional and will not be replaced by empty strings if not specified.
```json
{
    "currency": "dollar",
    "category": "1"
}
```
- POST http://localhost:3000/productImage/:productID w. JSON body : Add images to a product. Images BLOBs must be in a string separated by commas. No ids.
```json
{
    "images": "848016608498FE15C6050001000006020007002E000005E84501960844CFF,15C6050001000006020008002E000405E84,E15C6050001000006350800020000002E00010000"
}
```
- DELETE http://localhost:3000/productImage/:productID?imageId=** : delete an image for a given product
- DELETE http://localhost:3000/product : delete a product
- GET http://localhost:3000/productByName?pattern=**** : find product by name (exact match or pattern)
- GET http://localhost:3000/productByCategory/:id : find product by category

- POST http://localhost:3000/category w. JSON body : add a category. No id should be provided. 
```json
{"name": "sport"}
```