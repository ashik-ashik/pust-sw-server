const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId  } = require('mongodb');
// const res = require("express/lib/response");
const objectId = require("mongodb").objectId;
require('dotenv').config();
const uploadFile = require("express-fileupload")
const port = process.env.PORT || 5500;
app.use(cors());
app.use(express.json());
app.use(uploadFile());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.muk27.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const run = async () => {
  try{
    await client.connect();

    // create database and data tables
    const database = client.db("pust_sw");
    const userCollection = database.collection("members");
    const noticeCollection = database.collection("notices");


    
    // Add a new user API
    app.post("/user", async (req, res) => {
      const data = req.body;
      const userInfo = {fullName: data.displayName, email:data.email, registerDate: new Date().toLocaleDateString()};
      const result = await userCollection.insertOne(userInfo);
      res.json(result);
    });
    // get All users API
    app.get("/users", async (req, res) => {
      const result = await userCollection.find({}).sort({_id:-1}).toArray();
      res.json(result);
    });

    // Update user details setup information API
    app.put("/user", async (req, res) => {
      const query = {email:req.body.email};
      const userInfo = {$set: req.body};
      const result = await userCollection.updateOne(query, userInfo);
      res.json(result);
    });
    // Update user details setup information API
    app.put("/add-contact/:id", async (req, res) => {
      const query = {_id:ObjectId(req.params.id)};
      const userInfo = {$set: req.body};
      const result = await userCollection.updateOne(query, userInfo);      
      res.json(result);
    });

    // update social media links
    app.put("/add-social/:id", async (req, res) => {
      const userId = req.params.id;
      const query = {_id : ObjectId(userId)}
      const update = {$set:req.body};
      const result = await userCollection.updateOne(query, update);
      res.json(result);
    });
    
    // get current user
    app.get("/currentUser/:email", async (req, res)=> {
      const query = {email:req.params.email};
      const result = await userCollection.findOne(query);
      res.json(result);
    });

    // get user
    app.get("/getUser/:id", async (req, res) => {
      const userId = req.params.id;
      const query = {_id:ObjectId(userId)}
      const result = await userCollection.findOne(query);
      res.json(result);
    })

    // search member
    app.get("/searchMember/:data", async (req, res)=> {
      const query = {roll:req.params.data};
      const query2 = {reg:req.params.data}
      const result = await userCollection.findOne(query);
      const result2 = await userCollection.findOne(query2);
      res.json(result || result2);
    });

    // upload profile pic
    app.put("/upload-profile/:id", async (req, res) => {
      const userId = req.params.id;
      const file = req.files.image;
      const picData = file.data;
      const encodedPic = picData.toString('base64');
      const imageBuffer = Buffer.from(encodedPic, 'base64');
      const image = {profilePic: imageBuffer};
      const query = {_id:ObjectId(userId)};
      const update = {$set:image};
      const result = await userCollection.updateOne(query, update)
      res.json(result)
    });

    // update CR
    app.put("/upload-cr-ship/:id", async (req, res) => {
      const userId = req.params.id;
      const query = {_id : ObjectId(userId)}
      const update = {$set:req.body};
      const result = await userCollection.updateOne(query, update);
      res.json(result);
    });

    // approve cr status
    app.put("/approve-cr/:id", async (req, res) => {
      const approve = {CRstatus:"verified", isCR: true};
      const query = {_id: ObjectId(req.params.id)};
      const update = {$set: approve};
      const result = await userCollection.updateOne(query, update);
      res.json(result);
    });

    // delete CR-ship
    app.put("/remove-cr/:id", async (req, res) => {
      const query = {_id : ObjectId(req.params.id)};
      const removed = {isCR: false, CRstatus: "rejected"};
      const update = {$set : removed};
      const result = await userCollection.updateOne(query, update);
      res.json(result)
    });

    // delete user/member
    app.delete('/delete-member/:id', async (req, res) => {
      const query = {_id : ObjectId(req.params.id)};
      const result = await userCollection.deleteOne(query);
      res.json(result);
    });

    // publish Notice
    app.post("/publish-notice", async (req, res) => {
      const notice = req.body;
      notice.publishDate = new Date().toLocaleDateString()
      const result = await noticeCollection.insertOne(notice)
      res.json(result)
    });
    // load all notice
    app.get("/notices", async (req, res) => {
      const result = await noticeCollection.find({}).sort({_id: -1}).toArray();
      res.json(result);
    });
    // load a single notice
    app.get("/notice/:id", async (req, res)=> {
      const notice = {_id : ObjectId(req.params.id)};
      const result = await noticeCollection.findOne(notice);
      res.json(result);
    });

    // delete notice
    app.delete("/notice-delete/:id", async (req, res) => {
      const query = {_id : ObjectId(req.params.id)};
      const result = await noticeCollection.deleteOne(query);
      res.json(result);
    })

    app.get("/search-blood/:blood", async (req, res) => {
      const blood = (req.params.blood);
      const query = {blood : blood};
      const result = await userCollection.find(query).toArray();
      console.log(query, result)
      res.json(result)
    })    


  }finally{
    app.get("/", async (req, res) => {
      console.log("Server is on!")
      res.send("PUST-SW Server is on")
    });
  }
}
run().catch(console.dir);

app.get("/", async (req, res) => {
  console.log("Server is on!")
  res.send("PUST-SW Server is on")
});

app.listen(port, () => {
  console.log("PUST SW server is on!!!", port )
});
