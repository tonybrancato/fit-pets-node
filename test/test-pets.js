global.DATABASE_URL = 'mongodb://localhost/jwt-auth-demo-test';
const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const jwt = require('jsonwebtoken');
const moment = require('moment');
const {Pet} = require('../pets/models');
const faker = require('faker');
const mongoose = require('mongoose');
const {app, runServer, closeServer} = require('../server');
const {User} = require('../users');
const {JWT_SECRET} = require('../config');
const {TEST_DATABASE_URL} = require('../config');
const should = chai.should();
const expect = chai.expect;



function pickOneOfThese (a, b) {
  const decider = Math.random();
  if (decider < .5) {
    return a;
  } else {
    return b;
  }
}

function randomWeight () {
  return  (Math.floor(Math.random()*100)).toString();
}

function seedPetData(owner) {
  console.info('seeding pet data');
  const seedData = [];

  for (let i=1; i<=10; i++) {
    seedData.push(generatePets(owner));
  }
  // this will return a promise
  return Pet.insertMany(seedData);
}

function tearDownDb() {
    console.warn('Deleting database');
    return mongoose.connection.dropDatabase();
}

function generatePets(owner) {
  return {
    _owner: owner,
    name: faker.name.firstName(),
    species: pickOneOfThese('Cat', 'Dog'),
    sex: pickOneOfThese('Male', 'Female'),
    birthday: moment.utc().format('L'),
    weights: [{
      weight: randomWeight(),
      weightDate: moment.utc().format('L')
    }],
    foodBrand: faker.commerce.productName(),
  }
}
const username = 'exampleUser';
const password = 'examplePass';
const firstName = 'Example';
const lastName = 'User';
const id = username;

describe('Fit Pets API resource', function() {
  // create user and JWT to be used in pet creation
  const username = 'exampleUser';
  const password = 'examplePass';
  const firstName = 'Example';
  const lastName = 'User';
  before(function() {
    return runServer(TEST_DATABASE_URL);
  });

  beforeEach(function() {
    return User.hashPassword(password)
      .then(password => User.create({username, password, firstName, lastName}))
      .then(seedPetData(username));
  });

  afterEach(function() {
    return tearDownDb();
  });

  after(function() {
    return closeServer();
  })

  it('should retrieve pets of a logged in user', function() {

    const token = jwt.sign(
      {
          user: {
              username,
              firstName,
              lastName,
              id
          }
      },
      JWT_SECRET,
      {
          algorithm: 'HS256',
          subject: username,
          expiresIn: '7d'
      }
  );

    let res;
    return chai.request(app)
      .get(`/api/pets/${username}`)
      .set('authorization', `Bearer ${token}`)
      .then(function(_res) {
        res = _res;
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.an('object');        
        res.body.pets.length.should.be.at.least(1);
        const expectedKeys = ['name', 'species', 'sex', 'birthday', 'age', 'id', 
                              'weights', 'owner'];
        res.body.pets.forEach(function(item) {
          item.should.be.a('object');
          item.should.include.keys(expectedKeys);
        });    
      });
  });

  // POST

    it('should add a new pet on POST', function() {
      const token = jwt.sign(
        {
          user: {
            username,
            firstName,
            lastName,
            id
          }
        },
        JWT_SECRET,
        {
          algorithm: 'HS256',
          subject: username,
          expiresIn: '7d'
        }
      );
      const newPet = generatePets(username);
      let res;
      return chai.request(app)
        .post('/api/pets')
        .set('authorization', `Bearer ${token}`)
        .send(newPet)
        .then(function(_res) {
          res = _res;
          res.should.have.status(201);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.id.should.not.be.null;
          res.body.id.should.not.be.undefined;
          res.body.name.should.equal(newPet.name);
          return Pet.findById(res.body.id);
        })
        .then(function(pet) {
          console.log(pet);
          console.log(newPet);
         pet.name.should.equal(newPet.name);
         pet.species.should.equal(newPet.species);
         pet.sex.should.equal(newPet.sex);
         pet.birthday.should.equal(newPet.birthday);
        })
    });
  
  // PUT

  it('should update a pets weight', function() {
    const token = jwt.sign(
      {
          user: {
              username,
              firstName,
              lastName,
              id
          }
      },
      JWT_SECRET,
      {
          algorithm: 'HS256',
          subject: username,
          expiresIn: '7d'
      }
  );

    let res;
    return chai.request(app)
      .get(`/api/pets/${username}`)
      .set('authorization', `Bearer ${token}`)
      .then(function(_res) {
        res = _res;       
        petId = res.body.pets[0].id;
        const updateData = {
          weight: randomWeight(),
          id: petId
        };
        return chai.request(app)
          .put(`/api/pets/weight/${res.body.pets[0].id}`)
          .set('authorization', `Bearer ${token}`)
          .send(updateData)
      })
      .then(function(res2) {
        res2.should.have.status(204);
      });
  });

  // DELETE 
  
  it('should delete items on DELETE', function() {
    const token = jwt.sign(
      {
          user: {
              username,
              firstName,
              lastName,
              id
          }
      },
      JWT_SECRET,
      {
          algorithm: 'HS256',
          subject: username,
          expiresIn: '7d'
      }
  );
    let res;
    return chai.request(app)
      .get(`/api/pets/${username}`)
      .set('authorization', `Bearer ${token}`)
      .then(function(_res) {        
        res = _res;
        return chai.request(app)
          .delete(`/api/pets/${username}/${petId}`)
          .set('authorization', `Bearer ${token}`)
      })
      .then(function(res) {
        res.should.have.status(204);
      });
  });
});