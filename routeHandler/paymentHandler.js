/* eslint-disable prettier/prettier */
/* eslint-disable quotes */
/* eslint-disable prettier/prettier */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable prettier/prettier */

const express = require('express');

const mongoose = require('mongoose');

const router = express.Router();
require('dotenv').config();

const stripe = require('stripe')("sk_test_51IeGjvINoMfSFYtpwj9kSP12Cxjd1HvPxEbDKRyPgxAHUcjT1Cb9IL8ek8fCBlXX7g4H6dRasKV8vVMFZc21nd3N00I1ai6Fdj");

const paymentSchema = new mongoose.Schema({}, { strict: false });
const Payment = new mongoose.model('Payment', paymentSchema);

router.post('/', (req, res) => {
  const token = req.body;
  const newPayment = new Payment(req.body);
  newPayment.save((err) => {
    if (err) {
      res.status(500).json({
        error: 'There was a server side error!',
      });
    } else {
      res.status(200).json({
        message: 'Payment story was recorded successfully!',
      });
    }
  });

  stripe.customers
    .create({
      email: token.email,
      source: token.id,
    })
    .then((customer) => stripe.invoiceItems
        .create({
          amount: 60 * 100,
          customer: customer.id,
          currency: 'usd',
          email: token.email,
        })
        .then((invoiceItem) => stripe.invoices.create({
            collection_method: 'send_invoice',
            customer: invoiceItem.customer,
            days_until_due: 10,
            email: token.email,
          }))

        .catch((err) => {
          console.log(err);
        }));
});

module.exports = router;
