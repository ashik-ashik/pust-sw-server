const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion  } = require('mongodb');
const res = require("express/lib/response");
const objectId = require("mongodb").objectId;
require('dotenv').config();
const port = process.env.PORT || 5500;
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.muk27.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const run = async () => {
  try{
    await client.connect();

    // create database and data tables
    const database = client.db("pust_sw");
    const userCollection = database.collection("members");

    // Empty API
    app.get("/", async (req, res) => {
      console.log("Server is on!")
    });
    
    // Add a new user API
    app.post("/user", async (req, res) => {
      const data = req.body;
      const userInfo = {fullName: data.displayName, email:data.email, registerDate: new Date().toLocaleDateString()};
      const result = await userCollection.insertOne(userInfo);
      res.json(result);
    });
    // get All users API
    app.get("/users", async (req, res) => {
      const result = await userCollection.find({}).toArray();
      res.json(result);
    });

    // Update user details setup information API
    app.put("/user", async (req, res) => {
      const query = {email:req.body.email};
      const option = {upsert: true};
      const userInfo = {$set: req.body};
      const result = await userCollection.updateOne(query, userInfo, option);
      res.json(result);
    });

    // get current user
    app.get("/currentUser/:email", async (req, res)=> {
      const query = {email:req.params.email};
      const result = await userCollection.findOne(query);
      res.json(result);
    });

    // search member
    app.get("/searchMember/:data", async (req, res)=> {
      const query = {roll:req.params.data};
      const query2 = {reg:req.params.data}
      const result = await userCollection.findOne(query);
      const result2 = await userCollection.findOne(query2);
      res.json(result || result2);
    });

  }finally{

  }
}
run().catch(console.dir);


app.listen(port, () => {
  console.log("PUST SW server is on!!!", port )
});
