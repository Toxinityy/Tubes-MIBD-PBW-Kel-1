import express from 'express';
import { getProductDetails, getReview, getSubCategories, addReview } from '../models/productDetailsModel.js';
import { dbConnect } from '../index.js';

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.get('/product-details', async (req, res) => {
  try {
    const conn = await dbConnect();
    const productId = req.query.id;
    const productDetails = await getProductDetails(conn, productId);
    const subCategories = await getSubCategories(conn, productId);
    const reviews = await getReview(conn, productId);
    
    res.render('product-details', { 
      user: req.session.username,
      productDetails,
      subCategories,
      reviews,
      req
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Internal Server Error' });
  }
});


export default router;
