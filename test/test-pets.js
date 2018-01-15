global.DATABASE_URL = 'mongodb://localhost/jwt-auth-demo-test';
const chai = require('chai');
const chaiHttp = require('chai-http');
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
chai.use(chaiHttp);


function pickOneOfThese (a, b) {
  const decider = Math.random();
  if (decider < .5) {
    return a;
  } else {
    return b;
  }
}

function randomWeight () {
  return  Math.floor(Math.random()*100);
}

function seedPetData() {
  console.info('seeding pet data');
  const seedData = [];

  for (let i=1; i<=10; i++) {
    seedData.push(generatePets());
  }
  // this will return a promise
  return Pet.insertMany(seedData);
}

function tearDownDb() {
    console.warn('Deleting database');
    return mongoose.connection.dropDatabase();
}

function generatePets() {
  return {
    _owner: '123456789',
    name: faker.name.firstName(),
    species: pickOneOfThese('Cat', 'Dog'),
    sex: pickOneOfThese('Male', 'Female'),
    birthday: moment.utc().format('L'),
    weight: randomWeight(),
    weightDate: moment.utc().format('L'),
    foodBrand: faker.commerce.productName(),
  }
}

describe('Fit Pets API resource', function() {

  before(function() {
    return runServer(TEST_DATABASE_URL);
  });

  beforeEach(function() {
    return seedPetData();
  });

  afterEach(function() {
    return tearDownDb();
  });

  after(function() {
    return closeServer();
  })

  it('should show a 200 status', function() {

  // GET
    let res;
    return chai.request(app)
      .get('/api/test/')
      .then(function(_res) {
        console.log((_res.body.pets).length);
        // console.log(_res);
        res = _res;
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.an('object');        
        res.body.pets.length.should.be.at.least(1);
        const expectedKeys = ['name', 'species', 'sex', 'birthday', 'age', 'id', 
                              'weight', 'startingWeight', 'weightDate', 'foodBrand'];
        res.body.pets.forEach(function(item) {
          item.should.be.a('object');
          item.should.include.keys(expectedKeys);
        });    
      });
  });

  // POST

    // it('should add a new pet on POST', function() {
    //   const newPet = generatePets();
    //   return chai.request(app)
    //     .post('/api/test')
    //     .send(newPet)
    //     .then(function(res) {
    //       res.should.have.status(201);
    //       res.should.be.json;
    //       res.body.should.be.a('object');
    //       res.body.id.should.not.be.null;
    //       res.body.id.should.not.be.undefined;
    //       res.body.name.should.equal(newPet.name);
    //       return Pet.findById(res.body.id);
    //     })
    //     .then(function(pet) {
    //      pet.name.should.equal(newPet.name);
    //      pet.type.should.equal(newPet.type);
    //      pet.genre.should.equal(newPet.genre);
         
    //     })
    // });
  
  // PUT

  // it('should update items on PUT', function() {

  //   const updateData = {
  //     plays: {
  //       date: faker.date.past(),
  //       players: faker.random.number({min:1, max:99})
  //     }
  //   };

  //   return chai.request(app)
  //     .get('/api/board-games')
  //     .then(function(res) {
  //       updateData.id = res.body.boardGames[0].id;
  //       return chai.request(app)
  //         .put(`/api/board-games/${updateData.id}`)
  //         .send(updateData);
  //     })
  //     .then(function(res) {
  //       res.should.have.status(204);
  //       res.request._data.should.be.a('object');
  //       res.request._data.should.deep.equal(updateData);
  //     });
  // });

  // DELETE 
  // it('should delete items on DELETE', function() {
  //   return chai.request(app)
  //     .get('/api/board-games')
  //     .then(function(res) {
  //       return chai.request(app)
  //         .delete(`/api/board-games/${res.body.boardGames[0].id}`);
  //     })
  //     .then(function(res) {
  //       res.should.have.status(204);
  //     });
  // });
});