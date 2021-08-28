import { config } from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import Stripe from 'stripe';

const router = express.Router();
config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2020-08-27',
});

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
        // eslint-disable-next-line consistent-return
        .then(async (customer) => {
            try {
                const invoiceItem = await stripe.invoiceItems.create({
                    amount: 60 * 100,
                    customer: customer.id,
                    currency: 'usd',
                });
                return await stripe.invoices.create({
                    collection_method: 'send_invoice',
                    customer: invoiceItem.customer as string,
                    days_until_due: 10,
                });
            } catch (err) {
                console.log(err);
            }
        });
});

router.get('/:email', async (req, res) => {
    try {
        const data = await Payment.find({ email: req.params.email });
        res.status(200).json({
            data,
            message: 'Data collected',
        });
    } catch (err) {
        res.status(500).json({
            error: 'There was a server side error',
        });
    }
});

export default router;
