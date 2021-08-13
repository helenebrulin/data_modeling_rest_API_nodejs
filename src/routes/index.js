const express = require('express');
const router  = express.Router(); 
const { body, param, query } = require('express-validator');
const apiErrorReporter = require('../utils/apierrorreporter');
const productController = require('../controllers/product_controller'); 
const categoryController = require('../controllers/category_controller'); 

router.post(
    '/products',
    [
      body('name').not().isEmpty().trim().escape(),
      body('description').not().isEmpty().trim().escape(),
      body('vendor').not().isEmpty().trim().escape(),
      body('price').isInt(),
      body('currency').not().isEmpty().trim().escape(),
      body('category').not().isEmpty().isInt(),
      body('images').trim().escape(),
      apiErrorReporter,
    ],
    async (req, res, next) => {
      try {
        await productController.add(req.body);
        return res.status(201).send('OK');
      } catch (err) {
        return next(err);
      }
    },
  );

  router.get(
    '/products',
    async (req, res, next) => {
      try {
        const products = await productController.findAll();
        return (products ? res.status(200).json(products) : res.sendStatus(404));
      } catch (err) {
        return next(err);
      }
    },
  );


router.get(
    '/products/:id',
    [
      param('id').isInt().not().isEmpty(),
      apiErrorReporter,
    ],
    async (req, res, next) => {
      try {
        const product = await productController.findById(req.params.id);
        return (product ? res.status(200).json(product) : res.sendStatus(404));
      } catch (err) {
        return next(err);
      }
    },
  );

  router.put(
    '/products/:id',
    [
      param('id').isInt().optional(),
      body('name').trim().escape().optional(),
      body('description').trim().escape().optional(),
      body('vendor').trim().escape().optional(),
      body('price').isInt().optional(),
      body('currency').trim().escape().optional(),
      body('category').isInt().optional(),
      apiErrorReporter,
    ],
    async (req, res, next) => {
      try {
        await productController.update(req.params.id, req.body);
        return res.status(201).send('OK');
      } catch (err) {
        return next(err);
      }
    },
  );

  router.delete(
    '/products/:id',
    [
      param('id').isInt(),
      apiErrorReporter,
    ],
    async (req, res, next) => {
      try {
        await productController.del(req.params.id);
        return res.status(200).send('OK');
      } catch (err) {
        return next(err);
      }
    },
  );

  router.post(
    '/productImage/:id',
    [
      param('id').isInt().not().isEmpty(),
      body('images').not().isEmpty().trim().escape(),
      apiErrorReporter,
    ],
    async (req, res, next) => {
      try {
        await productController.addImage(req.body.images, req.params.id);
        return res.status(201).send('OK');
      } catch (err) {
        return next(err);
      }
    },
  );

  router.delete(
    '/productImage/:id',
    [
      param('id').isInt().not().isEmpty(),
      query('imageId').isInt().not().isEmpty(),
      apiErrorReporter,
    ],
    async (req, res, next) => {
      try {
        await productController.deleteImage(req.query.imageId, req.params.id);
        return res.status(201).send('OK');
      } catch (err) {
        return next(err);
      }
    },
  );

  router.get(
    '/productsByName',
    async (req, res, next) => {
      try {
        const products = await productController.findByName(req.query.pattern);
        return (products ? res.status(200).json(products) : res.sendStatus(404));
      } catch (err) {
        return next(err);
      }
    },
  );

  router.get(
    '/productsByCategory/:id',
    [
        param('id').isInt().not().isEmpty(),
        apiErrorReporter,
    ],
    async (req, res, next) => {
      try {
        const products = await productController.findByCategory(req.params.id);
        return (products ? res.status(200).json(products) : res.sendStatus(404));
      } catch (err) {
        return next(err);
      }
    },
  );



  router.post(
    '/categories',
    [
        body('name').not().isEmpty().trim().escape().not().isEmpty(),
        apiErrorReporter,
    ],
    async (req, res, next) => {
      try {
        await categoryController.add(req.body.name);
        return res.status(200).send('OK');
      } catch (err) {
        return next(err);
      }
    },
  );


module.exports = router; 