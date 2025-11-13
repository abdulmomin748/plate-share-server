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

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.mz4jlxs.mongodb.net/?appName=Cluster0`;

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
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    const db = client.db("plateShareCmDB");
    const foodsCollection = db.collection("foods");
    const reqFoodsCollection = db.collection("req_foods");

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
    });

    app.get("/myFoods", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const cursor = foodsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
      // console.log(email, query, result);
    });

    // update food_doc
    app.put("/myFoods/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const doc = req.body;
      const updateDoc = {
        $set: doc,
      };
      const options = {};
      const result = await foodsCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
      // console.log(filter, doc, updateDoc);
    });

    app.delete("/myFoods/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await foodsCollection.deleteOne(filter);
      res.send(result);
    });

    app.post("/addFood", async (req, res) => {
      const doc = req.body;
      const result = await foodsCollection.insertOne(doc);
      res.send(result);
      // console.log(doc);
    });

    app.post("/reqFood", async (req, res) => {
      const doc = req.body;
      const result = await reqFoodsCollection.insertOne(doc);
      res.send(result);
      console.log(result);
    });

    app.get("/reqFood", async (req, res) => {
      const id = req.query.id;
      const email = req.query.email;

      const food = await foodsCollection.findOne({ _id: new ObjectId(id) });

      const request = await reqFoodsCollection.find({ foodId: id }).toArray();
      res.send(request);

      //console.log(id, email, food, request);

      // res.send(result);
    });

    app.get("/myReqFood", async (req, res) => {
      const email = req.query.email;
      const query = { userEmail: email };
      const reqFood = reqFoodsCollection.find(query);
      const result = await reqFood.toArray();
      res.send(result);

      // console.log(email, query, result);
    });

    app.patch("/reqFood/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDocReqStatus = {
        $set: {
          food_status: "Accepted",
        },
      };
      const result = await reqFoodsCollection.updateOne(
        filter,
        updateDocReqStatus
      );

      const request = await reqFoodsCollection.findOne({
        _id: new ObjectId(id),
      });
      await foodsCollection.updateOne(
        { _id: new ObjectId(request.foodId) },
        { $set: { food_status: "Donated" } }
      );
      res.send(result);
      // console.log(filter, result);
    });
    app.patch("/reqFoodRejected/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDocReqStatus = {
        $set: {
          food_status: "Rejected",
        },
      };
      const result = await reqFoodsCollection.updateOne(
        filter,
        updateDocReqStatus
      );
      res.send(result);
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
