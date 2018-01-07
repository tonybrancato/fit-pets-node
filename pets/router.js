
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose')
const moment = require('moment');

const {Pet} = require('./models');
console.log(moment.utc().format("L"))
const router = express.Router();

const jsonParser = bodyParser.json();

// ES6 promises for mongoose
mongoose.Promise = global.Promise;

// GET -- Take out of final code or make for server level admin
router.get('/', (req, res) => {
  console.log(req.user.id);
  Pet
    .find()
    .then(pets => {
      res.json({
        pets: pets.map(
          (pet) => pet.apiRepr())
      });
    })
    .catch(
      err => {
        console.error(err);
        res.status(500).json({message: 'Internal server error'});
    });
});
// GET pets by owner
router.get('/:_owner', (req, res) => {
  console.log(req.params._owner);
  console.log('req.params._owner = ' + req.params._owner)  
  Pet
    .find({'_owner' : req.params._owner})
    .then(pets => {
      res.json({
        pets: pets.map(
          (pet) => pet.apiRepr()) 
      });
    })
    .catch(err => {
      console.error(err);
        res.status(500).json({message: 'Internal server error'})
    });
});
// POST
router.post('/', jsonParser, (req, res) => {
  
//   const requiredFields = ['name'];
//   for (let i=0; i<requiredFields.length; i++) {
//     const field = requiredFields[i];
//     if (!(field in req.body)) {
//       const message = `Missing \`${field}\` in request body`
//       console.error(message);
//       return res.status(400).send(message);
//     }
// }

Pet
  .create({
    _owner: req.user.id,
    name: req.body.name,
    species: req.body.species,
    sex: req.body.sex,
    birthday: req.body.birthday,
    weight: req.body.weight,
    weightDate: moment.utc().format('l'),
    // weights: {
    //   weight: req.body.weight,
    //   weightDate: moment.utc().format('l')
    // }
  })
  .then(
    pet => res.status(201).json(pet.apiRepr()))
  .catch(err => {
    console.error(err);
    res.status(500).json({message: 'Internal server error'});
  });
  console.log(req.body);
});

// PUT *make sure that the pet id belongs to the user

// Weight update
router.put('/weight/:id', jsonParser, (req, res) => {
  if (req.params.id !== req.body.petId) {
    const msg = (
      `*****request path id (${req.params.id}) and request body id
      (${req.body.id}) must match*****`);
    // console.error(message + '-----req.body is ' + JSON.stringify(req.body.id));
    res.status(400).json({message: msg});
  }
  
  const toUpdate = {};
  const updatableFields = ['weight', 'weightDate'];
  updatableFields.forEach(field => {
    if (field in req.body) {
      toUpdate[field] = req.body[field];
    }
    console.log(toUpdate)
    // console.log(`${toUpdate}  req.params.id === ${req.params.id} owner === ${req.user.id} `)  
  });
 
  Pet
    .findOneAndUpdate({'_id':req.params.id, '_owner':req.user.id}, {$push: toUpdate})     
    .findOneAndUpdate({'_id':req.params.id, '_owner':req.user.id}, {$push: {weightDate: moment.utc().format('L')}})
    // .findOneAndUpdate({'_id':req.params.id, '_owner':req.user.id}, {$push: {toUpdate}})
    .then(pet => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Internal server error'}));
 });

 // Commands Update
//  router.put('/commands/:id', jsonParser, (req, res) => {
//   if (req.params.id !== req.body.id) {
//     const msg = (
//       `*****request path id (${req.params.id}) and request body id
//       (${req.body.id}) must match*****`);
//     // console.error(message + '-----req.body is ' + JSON.stringify(req.body.id));
//     res.status(400).json({message: msg});
//   }
  
//   const toUpdate = {};
//   const updatableFields = ['commands', 'commandDate'];
//   updatableFields.forEach(field => {
//     if (field in req.body) {
//       toUpdate[field] = req.body[field];
//     }
//     console.log(toUpdate)
//     // console.log(`${toUpdate}  req.params.id === ${req.params.id} owner === ${req.user.id} `)  
//   });
 
//   Pet
//     .findOneAndUpdate({'_id':req.params.id, '_owner':req.user.id}, {$push: toUpdate})     
//     .findOneAndUpdate({'_id':req.params.id, '_owner':req.user.id}, {$push: {commandDate: moment.utc().format('L')}})
//     // .findOneAndUpdate({'_id':req.params.id, '_owner':req.user.id}, {$push: {toUpdate}})
//     .then(pet => res.status(204).end())
//     .catch(err => res.status(500).json({message: 'Internal server error'}));
//  });

 
// DELETE
  // add logic for pet not found
router.delete('/:id', (req, res) => {
  console.log(req.user.id);
  Pet
    .findOneAndRemove({'_id':req.params.id, '_owner':req.user.id}, () => {
      if (req.user.id != '_owner') {
        res.status(401).json({message: 'You are not authorized to complete this action.'})
      }
    })
    .then(pet => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});
module.exports = {router};
