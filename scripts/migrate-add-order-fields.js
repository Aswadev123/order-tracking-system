/* Migration script: populate missing order detail fields with null/defaults.

Run with:
  node scripts/migrate-add-order-fields.js

It loads .env.local if present and connects to MongoDB.
*/

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const Order = require('../models/Order').default || require('../models/Order');

async function run() {
  const uri = process.env.MONGO_URI ;
  console.log('Connecting to', uri);
  await mongoose.connect(uri);

  const res = await Order.updateMany(
    {},
    {
      $set: {
        pickAddress: null,
        phone: null,
        cost: null,
        details: null,
      },
    }
  );

  console.log('Matched:', res.matchedCount, 'Modified:', res.modifiedCount);
  await mongoose.disconnect();
  console.log('Migration complete');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
