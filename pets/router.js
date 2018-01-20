
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose')
const moment = require('moment');

const {Pet} = require('./models');
const router = express.Router();

const jsonParser = bodyParser.json();

// ES6 promises for mongoose
mongoose.Promise = global.Promise;

// GET pets by owner


router.get('/:_owner', (req, res) => {
  if (req.params._owner !== req.user.id) {
    const message = ('Unauthorized access');
    res.status(401).json({message: message});
  }
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

  Pet
    .create({
      _owner: req.user.id,
      name: req.body.name,
      species: req.body.species,
      sex: req.body.sex,
      birthday: req.body.birthday,
      weight: req.body.weight,
      weightDate: moment.utc().format('L'),
      foodBrand: req.body.food
    })
    .then(
      pet => res.status(201).json(pet.apiRepr()))
    .catch(err => {
      console.error(err);
      res.status(500).json({message: 'Internal server error'});
    });
});

// PUT *make sure that the pet id belongs to the user

// Weight update
router.put('/weight/:id', jsonParser, (req, res) => {
  if (req.params.id !== req.body.id) {
    const message = (
      `*****request path id (${req.params.id}) and request body id
      (${req.body.id}) must match*****`);
    console.error(message + '-----req.body is ' + JSON.stringify(req.body.id));
    res.status(400).json({message: message});
  }
  
  const toUpdate = {};
  const updatableFields = ['weight', 'weightDate'];
  updatableFields.forEach(field => {
    if (field in req.body) {
      toUpdate[field] = req.body[field];
    }
  });
 
  Pet
    .findOneAndUpdate({'_id':req.params.id, '_owner':req.user.id}, {$push: toUpdate})     
    .findOneAndUpdate({'_id':req.params.id, '_owner':req.user.id}, {$push: {weightDate: moment.utc().format('L')}})
    .then(pet => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Internal server error'}));
 });

// DELETE
  // add logic for pet not found
router.delete('/:_owner/:id', (req, res) => {
  Pet
    .findOneAndRemove({'_id':req.params.id, '_owner':req.user.id}, () => {
      if (req.user.id !== req.params._owner) {
       return res.status(401).json({message: 'You are not authorized to complete this action.'})
      }
    })
    .then(pet => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});
module.exports = {router};
