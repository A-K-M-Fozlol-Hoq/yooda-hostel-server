//external imports
const express = require('express');
const http = require('http');
const cors = require('cors');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const { MongoClient } = require('mongodb');

const port = process.env.PORT || 4000;

const app = express();
require('dotenv').config();

//database connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nlclv.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  connectTimeoutMS: 30000,
  keepAlive: 1,
});

//middlewars
app.use(cors());
app.use(bodyParser.json());
app.use(fileUpload());

app.get('/', (req, res) => res.send('Hello World!'));

client.connect((err) => {
  const userCollection = client.db('yoodaHostel').collection('usersData');
  const foodsCollection = client.db('yoodaHostel').collection('foods');
  const feedsCollection = client.db('yoodaHostel').collection('feed');

  app.post('/addFood', (req, res) => {
    // FoodItem(id, name, price)
    const id = req.body.id;
    const name = req.body.name;
    const price = req.body.price;
    foodsCollection
      .insertOne({
        id,
        name,
        price: parseInt(price),
      })
      .then((result) => {
        // console.log(result);
        res.send(result.acknowledged);
      });
  });

  app.post('/editFood', (req, res) => {
    const id = req.body.id;
    const name = req.body.name;
    const price = req.body.price;

    foodsCollection
      .updateOne(
        { id: id },
        { $set: { id: id, name: name, price: parseInt(price) } }
      )
      .then((response) => {
        res.send(response);
      });
  });

  app.post('/deleteFood', (req, res) => {
    const id = req.body.id;
    var myQuery = { id: id };
    foodsCollection.deleteOne(myQuery, (err, response) => {
      if (err) {
        console.log(err);
      } else {
        res.send(response);
      }
    });
  });

  app.post('/getFoods', (req, res) => {
    let { pageNumber } = req.body;

    var perPage = 10;

    // get records to skip
    var startFrom = pageNumber * perPage;
    // get data from mongo DB using pagination
    foodsCollection
      .find({})
      .skip(startFrom)
      .limit(perPage)
      .toArray()
      .then((response) => {
        res.send(response);
      })
      .catch((err) => console.log(err));
  });

  app.post('/addStudent', (req, res) => {
    // Student(id, fullName, roll, age, class, hall, status)

    const id = req.body.id;
    const fullName = req.body.fullName;
    const roll = req.body.roll;
    const age = req.body.age;
    const _class = req.body.class;
    const hall = req.body.hall;
    const status = req.body.status;
    console.log(req.body);
    userCollection
      .insertOne({
        id,
        fullName,
        roll: parseInt(roll),
        age: parseInt(age),
        class: parseInt(_class),
        hall,
        status,
      })
      .then((result) => {
        // console.log(result);
        res.send(result.acknowledged);
      });
  });

  app.post('/activeStudentsStatus', async (req, res) => {
    const { studentsIDList } = req.body;

    userCollection.updateMany(
      { id: { $in: studentsIDList } },
      { $set: { status: 'active' } },
      { multi: true }
    );
    return res.send({ success: true });
  });

  app.post('/inActiveStudentsStatus', async (req, res) => {
    const { studentsIDList } = req.body;

    userCollection.updateMany(
      { id: { $in: studentsIDList } },
      { $set: { status: 'inActive' } },
      { multi: true }
    );
    return res.send({ success: true });
  });

  app.post('/editStudent', (req, res) => {
    const id = req.body.id;
    const fullName = req.body.fullName;
    const roll = req.body.roll;
    const age = req.body.age;
    const _class = req.body.class;
    const hall = req.body.hall;
    const status = req.body.status;

    userCollection
      .updateOne(
        { id: id },
        {
          $set: {
            id,
            fullName,
            roll: parseInt(roll),
            age: parseInt(age),
            class: parseInt(_class),
            hall,
            status,
          },
        }
      )
      .then((response) => {
        res.send(response);
      });
  });

  app.post('/deleteStudent', (req, res) => {
    const id = req.body.id;
    var myQuery = { id: id };
    userCollection.deleteOne(myQuery, (err, response) => {
      if (err) {
        console.log(err);
      } else {
        res.send(response);
      }
    });
  });

  app.post('/getStudents', (req, res) => {
    let { pageNumber } = req.body;

    var perPage = 10;

    // get records to skip
    var startFrom = pageNumber * perPage;
    // get data from mongo DB using pagination
    userCollection
      .find({})
      .skip(startFrom)
      .limit(perPage)
      .toArray()
      .then((response) => {
        res.send(response);
      })
      .catch((err) => console.log(err));
  });

  app.post('/addServedFood', (req, res) => {
    // Distribution(id, studentId, date, shift,status, foodItemList)

    const id = req.body.id;
    const studentId = req.body.studentId;
    const date = req.body.date;
    const shift = req.body.shift;
    const status = req.body.status;
    const foodItemList = req.body.foodItemList;
    console.log(req.body);
    feedsCollection
      .insertOne({
        id,
        studentId,
        date,
        shift,
        status,
        foodItemList,
      })
      .then((result) => {
        // console.log(result);
        res.send(result.acknowledged);
      });
  });

  app.post('/isServed', (req, res) => {
    const studentId = req.body.studentId;
    const date = req.body.date;
    const shift = req.body.shift;
    feedsCollection
      .find({
        $and: [
          {
            studentId: studentId,
          },
          {
            date: date,
          },
          {
            shift: shift,
          },
          // {age:{$gt:minAge,$lt:maxAge}}
        ],
      })
      .toArray((err, served) => {
        if (served && user.served > 0) {
          res.send(true);
        } else {
          res.send(false);
        }
      });
  });

  app.post('/getStudentsByRoll', (req, res) => {
    const roll = req.body.roll;
    userCollection.find({ roll: roll }).toArray((err, user) => {
      if (user && user.length > 0) {
        res.send(user);
      } else {
        console.log(
          'Student not found, server side error -getStudentsByRoll',
          user,
          email,
          err
        );
      }
    });
  });

  console.log('database connected successfully');
  // client.close();
});

app.listen(port, () =>
  console.log(`Example app listening at http://localhost:${port}`)
);
