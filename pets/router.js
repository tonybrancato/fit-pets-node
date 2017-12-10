const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose')

const {Pet} = require('./models');

const router = express.Router();

const jsonParser = bodyParser.json();

// ES6 promises for mongoose
mongoose.Promise = global.Promise;

// GET
router.get('/', (req, res) => {
  console.log(req.user.id);
  console.log(req.params)
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

router.get('/:owner', (req, res) => {
  Pet
  console.log('req.params.owner = ' + req.params.owner)
    .find({'name' : req.params.owner})
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
    weight: req.body.weight})
  .then(
    pet => res.status(201).json(pet.apiRepr()))
  .catch(err => {
    console.error(err);
    res.status(500).json({message: 'Internal server error'});
  });
  console.log(req.body);
});
// PUT *make sure that the pet id belongs to the user

// DELETE *see PUT for user/pet validation

module.exports = {router};
