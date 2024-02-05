const express = require("express");
const cors = require("cors");
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const app = express();
const port = process.env.PORT || 3000;


const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
//middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());



const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.ws4mpjc.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});


const verifyToken = (req, res, next) => {
  const token = req?.cookies?.token;
  if (!token) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "unauthorized access" });
    }
    req.user = decoded;
    next();
  });
};


async function run() {
  try {
    // monjur code start
    const userCollection = client.db("domainHub").collection("users");
    // monjur code finish

    // Fahim Code Start
    const paymentTrueCollection = client.db("domainHub").collection("carts");
    const reviewCollection = client.db("domainHub").collection("reviews");
    // Fahim Code finish
    // Suhad Code Start
    const notificationCollection = client.db("domainHub").collection("notifications");
    // Suhad Code Finish

    // Digontha Code start
    const freeTrialUserCollection = client.db("domainHub").collection("freeTrialUsers");


    // Digontha Code finish
// suhad code start
app.get("/notifications/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await notificationCollection.findOne(query);
  res.send(result);
});
app.delete("/notifications/:id", async (req, res) => {
  const id = req.params.id;
  console.log(id);
  const query = { _id: new ObjectId(id) };
  const result = await notificationCollection.deleteOne(query);
  res.send(result);
});
app.get("/notifications", async (req, res) => {
  const result = await notificationCollection.find().toArray();
  res.send(result);
});
app.post("/notifications", async (req, res) => {
  const item = req.body;
  const result = await notificationCollection.insertOne(item);
  res.send(result);
});
// suhad code finish
    // monjur code 
    
    
    //Auth related api
    app.post("/jwt", async (req, res) => {
      const user = req.body;
      console.log("user for token", user);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1h",
      });

      res
        .cookie("token", token, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
          maxAge: 60 * 60 * 1000,
        })
        .send({ success: true });
    });

    app.post("/logout", async (req, res) => {
      const user = req.body;
      console.log("logout ", user);
      res.clearCookie("token", { maxAge: 0 }).send({ success: true });
    });

    app.get("/users", verifyToken, async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const cursor = { email: email };
      const result = await userCollection.findOne(cursor);
      res.send(result);
    });
    
    app.get('/users/admin/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      let admin = false;
      if (user) {
        admin = user?.role === 'admin';
      }
      res.send({ admin });
    })

    app.post("/users", async (req, res) => {
      const user = req.body;
      const email = req.body.email;
      const cursor = { email: email };
      const existing = await userCollection.findOne(cursor);

      if (existing) {
        return res.send({ message: "User already exists" });
      } else {
        const result = await userCollection.insertOne(user);
        res.send(result);
      }
    });
    app.put("/users", async (req, res) => {
      const user = req.body;
      const email = req.body.email;
      const cursor = { email: email };
      console.log(user, email);
      const updatedDoc = {
        $set: {
          name: user.name,
          phone: user.phone,
        },
      };
      const result = await userCollection.updateOne(cursor, updatedDoc);
      res.send(result);
    });

    app.put("/users-role/:id", async (req, res) => {
      const info = req.body;
      const id = req.params.id;
      console.log(id);
      console.log(info);
      const cursor = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          role: info.role,
        },
      };
      console.log(updatedDoc);
      const result = await userCollection.updateOne(cursor, updatedDoc);
      console.log(result);
      res.send(result);
    });

    // monjur code finish

    //  Digontha Code start

    app.post("/freeTrialUsers", async (req, res) => {
      const user = {
        email: req.body.email,
        userName: req.body.userName,
        domainName: req.body.domainName,
        approve: req.body.approve,
     
      };
      const cursor = { email: user.email };
      const existing = await freeTrialUserCollection.findOne(cursor);
      if (existing) {
        return res.send({ message: "User already exists" });
      } else {
        console.log(user);
        const result = await freeTrialUserCollection.insertOne(user);
        console.log(user.status);
        res.send(result);

      }


    });

    app.get("/freeTrialUsers", async (req, res) => {
      const email = req.query.email;
      console.log(email);
      let query = {};
      if (email) {
        query = { email: email };
      }
      const result = await freeTrialUserCollection.find(query).toArray();
      console.log(req.body.approve);
      res.send(result);
    });

    app.put("/freeTrialUsers", async (req, res) => {
      const email = req.query.email
      const query = { email: email }
      const status = req.query.status
      console.log(status);
      const updatedData = {
        $set: {
          approve: status,
          createdAt: new Date(),
        }
      }
      const result = await freeTrialUserCollection.updateOne(query, updatedData)

      if(status == "Accepted"){
        console.log(status);
        await freeTrialUserCollection.createIndex({ createdAt: 1 }, { expireAfterSeconds: 40 });
      }

      res.send(result)
    });

    app.delete("/freeTrialUsers", async (req, res) => {
      const email = req.query.email
      const query = { email: email }
      const result = await freeTrialUserCollection.deleteOne(query);
      res.send(result);
    });



    //  Digontha Code finish

    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const domainCollection = client.db("domainHub").collection("domain");
    const cartsCollection = client.db("domainHub").collection("carts");

    // domain related api//Abubakar

    app.get("/domain", async (req, res) => {
      const result = await domainCollection.find().toArray();
      res.send(result);
    });

    app.get("/domain/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: id };
      const result = await domainCollection.findOne(query);
      res.send(result);
    });
    app.post("/domain", async (req, res) => {
      const item = req.body;
      const result = await domainCollection.insertOne(item);
      res.send(result);
    });
    // update domain
    app.patch("/domain/:id", async (req, res) => {
      const item = req.body;
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      console.log(filter);
      const updatedDoc = {
        $set: {
          name: item.name,
          category: item.category,
          price: item.price,
          description: item.description,
        },
      };
      // console.log(updatedDoc);
      const result = await domainCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });
    app.delete("/domain/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await domainCollection.deleteOne(query);
      res.send(result);
    });

    // carts related api//Abubakar
    // app.get("/carts", async (req, res) => {
    //   const result = await cartsCollection.find().toArray();
    //   res.send(result);
    // });
    app.get("/carts", async (req, res) => {
      const email = req.query.email;
      const cursor = { payment : "false", email}
      const result = await cartsCollection.find(cursor).toArray();
      res.send(result);
    });

    app.post("/carts", async (req, res) => {
      const item = req.body;
      const result = await cartsCollection.insertOne(item);
      res.send(result);
    });

    app.delete("/carts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await cartsCollection.deleteOne(query);
      res.send(result);
    });
    app.delete("/carts/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: ObjectId(id) };
      const result = await cartsCollection.deleteOne(query);
      res.send(result);
    });
    // carts related api//Abubakar

    app.put("/carts", async (req, res) => {
      try {
        const carts = req.body;
        console.log("carts", carts);

        // Loop through each item in the request body and update its payment status
        for (const item of carts) {
          const updatedDoc = {
            $set: {
              payment: "true",
            },
          };

          // Update the document in the MongoDB collection
          await cartsCollection.updateOne(
            { _id: new ObjectId(item._id) },
            updatedDoc
          );
        }
        res.status(200).json({ message: "Carts updated successfully" });
        console.log("Carts updated successfully");
      } catch (error) {
        console.log(error);
      }
    });

    // payment intent
    app.post("/create-payment-intent", async (req, res) => {
      const { price } = req.body;
      const amount = parseInt(price * 100);
      console.log(amount, "amount inside the intent");

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "bdt",
        payment_method_types: ["card"],
      });

      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    });

    // Fahim Review part
app.get('/paymentTrueCarts', async (req, res) => {
  try {
    const userEmail = req?.query?.email;
    const paymentValue = req?.query?.payment
    const query = {
      email: userEmail,
      payment: paymentValue,
    };
    const result = await paymentTrueCollection.find(query).toArray();
    res.send(result)
  }
  catch(error){
    console.log(error)
  }})

app.get('/myReview', async (req, res) => {
  const email = req?.query?.email
  const query = {userEmail: email}
  const result = await reviewCollection.find(query).toArray()
  res.send(result)
})
  app.get('/review', async (req, res) =>{
    const result = await reviewCollection.find().toArray()
    res.send(result)
  })
  app.post("/review", async (req, res) => {
      const reviewItem = req.body;
      const result = await reviewCollection.insertOne(reviewItem);
      res.send(result);
  });
  app.put("/cart/:id", async (req, res) => {
    const id = req.params.id;
    const cursor = { _id: new ObjectId(id) };
    const updatedDoc = {
      $set: {
        review: "true"
      },
    };
    const result = await cartsCollection.updateOne(cursor, updatedDoc);
    res.send(result);
  });
    // Fahim Review part

    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("database is coming soon....");
});

app.listen(port, (req, res) => {
  console.log(`database is running successfully , PORT : ${port} `);
});
