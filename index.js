//require packages
const express = require("express");
const mongoose = require("mongoose");
const stripe = require("stripe")(`${process.env.STRIPE_SECRET_KEY}`);
const uuid = require("uuid");
require("dotenv").config();

//server port
const port = process.env.PORT || 5000;

//express app initialization
const app = express();
app.use(express.json());

const cors = require("cors");
app.use(cors());

//database connection with mongoose
mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ghclx.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("Database connected successfully"))
  .catch((error) => console.log("ERROR", error));

//application routes

app.post("/payment", (req, res) => {
  const { henoPackage, token } = req.body;
  console.log("henoPackage", henoPackage);
  console.log("price", henoPackage.price);
  const idempontencyKey = uuid();

  return stripe.customers
    .create({
      email: token.email,
      source: token.id,
    })
    .then((customer) => {
      stripe.charges.create(
        {
          amount: product.price * 100,
          currency: "usd",
          customer: customer.id,
          receipt_email: token.email,
          description: `purchase package ${product.name}`,
          shipping: {
            name: token.card.name,
            address: {
              country: token.card.address_country,
            },
          },
        },
        { idempontencyKey }
      );
    })
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => console.log(err));
});

//root route
app.get("/", (req, res) => {
  res.send("Henosis server is running");
});

// default error handler
const errorHandler = (err, req, res, next) => {
  if (res.headerSent) {
    return next(err);
  }
  res.status(500).json({ error: err });
};

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Boss! I am listening to you at port:${port}`);
});
