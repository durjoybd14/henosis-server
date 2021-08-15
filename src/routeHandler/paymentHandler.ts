import { config } from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import stripeJs from 'stripe';

const router = express.Router();
config();

const stripe = new stripeJs(process.env.STRIPE_SECRET_KEY as string);

const paymentSchema = new mongoose.Schema({}, { strict: false });
const Payment = mongoose.model('Payment', paymentSchema);

router.post('/', (req, res) => {
    const token = req.body;
    const newPayment = new Payment(req.body);
    newPayment.save((err: mongoose.CallbackError) => {
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
        .then((customer) => {
            return stripe.invoiceItems
                .create({
                    amount: 60 * 100,
                    customer: customer.id,
                    currency: 'usd',
                })
                .then((invoiceItem) => {
                    return stripe.invoices.create({
                        collection_method: 'send_invoice',
                        customer: invoiceItem.customer,
                        days_until_due: 10,
                        email: token.email,
                    });
                })

                .catch((err) => {
                    console.log(err);
                });
        });
});

export default router;
