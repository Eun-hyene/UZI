'use strict';
const pool = require('../db');

async function getReviewsByStore(storeId) {
  const [rows] = await pool.query(
    'SELECT review_id, store_id, user_id, rating, comment, created_at FROM reviews WHERE store_id = :id ORDER BY created_at DESC',
    { id: storeId }
  );
  return rows;
}

async function createReview({ store_id, user_id, rating, comment }) {
  const [ret] = await pool.query(
    `INSERT INTO reviews (store_id, user_id, rating, comment)
     VALUES (:store_id, :user_id, :rating, :comment)`,
    { store_id, user_id, rating, comment }
  );
  const [rows] = await pool.query('SELECT * FROM reviews WHERE review_id = :id', { id: ret.insertId });
  return rows[0];
}

module.exports = { getReviewsByStore, createReview };


