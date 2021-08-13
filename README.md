# data_modeling_rest_API_nodejs

<b><u>Usage</u></b>
- Change product_dao.js to use different daos implementations : normal - w. pipelines - w. transactions
- Start with "node app.js".

<b><u>Data Modeling</u></b>
![data modeling](https://github.com/helenebrulin/data_modeling_rest_API_nodejs/blob/main/data%20modeling.png)

<b><u>Routes:</u></b>
- POST http://localhost:3000/products w. JSON body : add a product. Images BLOBs must be in a string separated by commas. No ids, for product or images, should be provided.
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
- GET http://localhost:3000/products : get all products
- GET http://localhost:3000/products/:id : get product by ID
- PUT http://localhost:3000/products/:id : update product (without images). All fields are optional and will not be replaced by empty strings if not specified.
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
- DELETE http://localhost:3000/products : delete a product
- GET http://localhost:3000/productsByName?pattern=**** : find product by name (exact match or pattern)
- GET http://localhost:3000/productsByCategory/:id : find product by category

- POST http://localhost:3000/categories w. JSON body : add a category. No id should be provided. 
```json
{"name": "sport"}
```