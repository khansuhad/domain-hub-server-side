const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.ws4mpjc.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // monjur code start
    const userCollection = client.db("domainHub").collection("users");
    // monjur code finish


    // Digontha Code start
    const freeTrialUserCollection = client.db("domainHub").collection("freeTrialUsers")
    // Digontha Code finish




    // monjur code start
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
    // monjur code finish


    //  Digontha Code start
    app.post("/freeTrialUsers", async (req, res) => {
      const user = req.body;
      console.log(user);
      const result = await freeTrialUserCollection.insertOne(user)
      res.send(result);
    });

    app.get("/freeTrialUsers", async (req, res) => {
      const email = req.query.email;
      console.log(email);
      let query = {}
      if(email){
        query = { email: email};
      }
      const result = await freeTrialUserCollection.find(query).toArray();
      res.send(result)
    });
   //  Digontha Code finish

    // Connect the client to the server	(optional starting in v4.7)
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
