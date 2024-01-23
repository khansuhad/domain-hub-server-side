const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors())
app.use(express.json())



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.ws4mpjc.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const domainCollection = client.db("domainHub").collection("domain");
    const cartsCollection = client.db("domainHub").collection("carts");


    // domain related api//Abubakar

    app.get('/domain', async (req, res) => {
      const result = await domainCollection.find().toArray();
      res.send(result);
    })


    app.get('/domain/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: (id) }
      const result = await domainCollection.findOne(query);
      res.send(result);
    })
    app.post('/domain', async (req, res) => {
      const item = req.body;
      const result = await domainCollection.insertOne(item);
      res.send(result);
    })
    // update domain
    app.patch('/domain/:id', async (req, res) => {
      const item = req.body;
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      console.log(filter);
      const updatedDoc = {
        $set: {
          name: item.name,
          category: item.category,
          price: item.price,
        }
      }
      // console.log(updatedDoc);
      const result = await domainCollection.updateOne(filter, updatedDoc)
      res.send(result)
    })
    // carts related api//Abubakar
    app.get('/carts', async (req, res) => {
      const result = await cartsCollection.find().toArray();
      res.send(result);
    })

    app.post('/carts', async (req, res) => {
      const item = req.body;
      const result = await cartsCollection.insertOne(item);
      res.send(result);
    })

    app.delete('/carts/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await cartsCollection.deleteOne(query);
      res.send(result);
    })
    app.delete('/carts/:id', async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: ObjectId(id) }
      const result = await cartsCollection.deleteOne(query);
      res.send(result);
    })
    // carts related api//Abubakar


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('database is coming soon....')
})

app.listen(port, (req, res) => {
  console.log(`database is running successfully , PORT : ${port} `);
})