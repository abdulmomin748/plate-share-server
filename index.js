//
const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 3000;

//
app.use(cors());
app.use(express.json());

// database user's credentials --->  mominurrahman017019_db_user  _ veHeE587FOH9eN1v

const uri =
  "mongodb+srv://mominurrahman017019_db_user:veHeE587FOH9eN1v@cluster0.mz4jlxs.mongodb.net/?appName=Cluster0";

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
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    const db = client.db("plateShareCmDB");
    const foodsCollection = db.collection("foods");

    app.get("/featuredFoods", async (req, res) => {
      const cursor = foodsCollection.find().sort({ foodQuantity: -1 }).limit(6);
      const reuslt = await cursor.toArray();
      res.send(reuslt);
      // console.log(reuslt);
    });
    app.get("/availableFoods", async (req, res) => {
      const cursor = foodsCollection.find({ food_status: "Available" });
      const reuslt = await cursor.toArray();
      res.send(reuslt);
      // console.log(reuslt);
    });
    app.get("/foodDetails/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await foodsCollection.findOne(query);
      res.send(result);
      console.log(cursor);
    });

    app.post("/addFood", (req, res) => {
      const doc = req.body;
      const result = foodsCollection.insertOne(doc);
      res.send(result);
      // console.log(doc);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

//
app.get("/", (req, res) => {
  res.send("Welcome to plateShare server!");
});
app.listen(port, () => {
  console.log(`plate server running on port ${port}`);
});
