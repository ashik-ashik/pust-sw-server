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
    const userAuthCollection = database.collection("useAuth");
    const noticeCollection = database.collection("notices");
    const eventsCollection = database.collection("events");


    
    // Add a new user API
    app.post("/user", async (req, res) => {
      const data = req.body;
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
      );
      const userInfo = {fullName: data.fullName, email:data.email, verificationCode:data.verificationCode, registerDate: new Date().toLocaleDateString()};
      const result = await userCollection.insertOne(userInfo);
      console.log(userInfo)
      res.json(result);
    });
    // Add a new user API
    app.post("/userAuth", async (req, res) => {
      const data = req.body;
      const result = await userAuthCollection.insertOne(data);
      console.log(data);
      res.json(result);
    });
    // get All users API
    app.get("/users", async (req, res) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
      );
      const members = await  userCollection.find({}).sort({_id:-1}).toArray();
      res.json(members);
    });
    // get All users API
    app.get("/fearured-members", async (req, res) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
      );
      const members = await  userCollection.find({}).limit(4).sort({_id:-1}).toArray();
      res.json(members);
    });

    app.get("/member-show", async (req, res) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
      );
      const cursor =  userCollection.find({})
      const counts = await userCollection.find({}).count(); //collection.countDocuments
      const page = req.query.page;
      const size = parseInt(req.query.size);
      let members;
      if(page){
        members = await cursor.skip(page*size).limit(size).sort({_id:-1}).toArray();
      }else{
        members = await cursor.limit(size).sort({_id:-1}).toArray();
      }
      res.json({
        counts,
        members
      });
    });

    // Update user details setup information API
    app.put("/user", async (req, res) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
      );
      const query = {email:req.body.email};
      const userInfo = {$set: req.body};
      const result = await userCollection.updateOne(query, userInfo);
      res.json(result);
    });

    // Update user details setup information API
    app.put("/add-contact/:id", async (req, res) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
      );
      const query = {_id:ObjectId(req.params.id)};
      const userInfo = {$set: {phone : req.body}};
      const result = await userCollection.updateOne(query, userInfo);      
      res.json(result);
    });
    // remove phone
    app.put("/remove-phone/:id", async (req, res) => {
      const query = {_id:ObjectId(req.params.id)};
      const userInfo = {$set: {phone : req.body.phones}};
      const result = await userCollection.updateOne(query, userInfo);      
      res.json(result);
    })

    // make a number whatsapp
    app.put("/add-whatsapp/:id", async (req, res) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
      );
      const query = {_id:ObjectId(req.params.id)};
      const userInfo = {$set: {whatsApp : req.body.number}};
      console.log(req.body, userInfo)
      const result = await userCollection.updateOne(query, userInfo);      
      res.json(result);
    });

    // update social media links
    app.put("/add-social/:id", async (req, res) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
      );
      const userId = req.params.id;
      const query = {_id : ObjectId(userId)}
      const update = {$set:req.body};
      const result = await userCollection.updateOne(query, update);
      res.json(result);
    });
    
    // get current user
    app.get("/currentUser/:email", async (req, res)=> {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
      );
      const query = {email:req.params.email};
      const result = await userCollection.findOne(query);
      res.json(result);
    });

    // get user
    app.get("/getUser/:id", async (req, res) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
      );
      const userId = req.params.id;
      const query = {_id:ObjectId(userId)}
      const result = await userCollection.findOne(query);
      res.json(result);
    })

    // search member
    app.get("/searchMember/:data", async (req, res)=> {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
      );
      const query = {roll:req.params.data};
      const query2 = {reg:req.params.data}
      const result = await userCollection.findOne(query);
      const result2 = await userCollection.findOne(query2);
      res.json(result || result2);
    });

    // upload profile pic
    app.put("/upload-profile/:id", async (req, res) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
      );
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
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
      );
      const userId = req.params.id;
      const query = {_id : ObjectId(userId)}
      const update = {$set:req.body};
      const result = await userCollection.updateOne(query, update);
      res.json(result);
    });

    // approve cr status
    app.put("/approve-cr/:id", async (req, res) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
      );
      const approve = {CRstatus:"verified", isCR: true};
      const query = {_id: ObjectId(req.params.id)};
      const update = {$set: approve};
      const result = await userCollection.updateOne(query, update);
      res.json(result);
    });

    // delete CR-ship
    app.put("/remove-cr/:id", async (req, res) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
      );
      const query = {_id : ObjectId(req.params.id)};
      const removed = {isCR: false, CRstatus: "rejected"};
      const update = {$set : removed};
      const result = await userCollection.updateOne(query, update);
      res.json(result)
    });

    // delete user/member
    app.delete('/delete-member/:id', async (req, res) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
      );
      const query = {_id : ObjectId(req.params.id)};
      const result = await userCollection.deleteOne(query);
      res.json(result);
    });

    // publish Notice
    app.post("/publish-notice", async (req, res) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
      );
      const notice = req.body;
      notice.publishDate = new Date().toLocaleDateString()
      const result = await noticeCollection.insertOne(notice)
      res.json(result)
    });
    // load all notice
    app.get("/notices", async (req, res) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
      );
      const result = await noticeCollection.find({}).sort({_id: -1}).toArray();
      res.json(result);
    });
    // load a single notice
    app.get("/notice/:id", async (req, res)=> {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
      );
      const notice = {_id : ObjectId(req.params.id)};
      const result = await noticeCollection.findOne(notice);
      res.json(result);
    });
    
    // delete notice
    app.delete("/notice-delete/:id", async (req, res) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
      );
      const query = {_id : ObjectId(req.params.id)};
      const result = await noticeCollection.deleteOne(query);
      res.json(result);
    });
    
    // publish event
    app.post("/publish-event", async (req, res) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
      );
      const notice = req.body;
      notice.publishDate = new Date().toLocaleDateString()
      const result = await eventsCollection.insertOne(notice)
      res.json(result)
    });
    // load events
    app.get("/events", async (req, res) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
      );
      const result = await eventsCollection.find({}).sort({_id:-1}).toArray()
      res.json(result)
    });

    // load single event
    app.get("/event/:id", async (req, res) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
      );
      const query = {_id : ObjectId(req.params.id)}
      const result = await eventsCollection.findOne(query)
      res.json(result)
    });

    // delete event
    app.delete("/event-delete/:id", async (req, res) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
      );
      const query = {_id : ObjectId(req.params.id)}
      const result = await eventsCollection.deleteOne(query)
      res.json(result)
    });

    // update event
    app.put("/update-event/:id", async (req, res)=>{
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
      );
      const query = {_id : ObjectId(req.params.id)};
      const update ={$set: req.body}
      const result = await eventsCollection.updateOne(query, update);
      res.json(result)
    });

    // load home and letest event
    app.get("/events/home", async (req, res) => {
      const result = await eventsCollection.find({}).limit(3).sort({_id:-1}).toArray();
      res.json(result);
    })
    // load home and letest notice
    app.get("/notice/home", async (req, res) => {
      const result = await noticeCollection.find({}).limit(3).sort({_id:-1}).toArray();
      res.json(result);
    })


    // update verification
    app.put("/verify/:id", async (req, res) => {
      const query = {_id : ObjectId(req.params.id)};
      const update = {$set : req.body};
      const result = await userCollection.updateOne(query, update);
      res.json(result);
    })



  }finally{
    app.get("/", async (req, res) => {
      console.log("Server is on!")
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
      );
      res.send("PUST-SW Server is on")
    });
  }
}
run().catch(console.dir);

app.get("/", async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
      );
  console.log("Server is on!")
  res.send("PUST-SW Server is on")
});

app.listen(port, () => {
  console.log("PUST SW server is on!!!", port )
});
