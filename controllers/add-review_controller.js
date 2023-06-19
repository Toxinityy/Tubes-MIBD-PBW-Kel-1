import express from 'express';
import { addReview } from '../models/productDetailsModel.js';
import { dbConnect } from '../index.js';

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.post('/add-review', async (req, res) => {
    try {
      console.log("sampe sini");
      const conn = await dbConnect();
      const productId = req.body.productId;
      const username = req.session.username;
      const { rating, reviews } = req.body;
  
      // Import function addReview
      await addReview(conn, productId, rating, reviews, username);
  
      // Redirect ke page yang sama
      res.redirect(`/product-details?id=${productId}`);
      conn.release();
  
    } catch (error) {
      console.error(error);
      res.status(500).render('error', { message: 'Internal Server Error' });
    }
  });

  export default router;
