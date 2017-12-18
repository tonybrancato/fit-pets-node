const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const PetsSchema = mongoose.Schema({
    _owner : { 
        type: String, 
        ref: 'User',
        required: true 
    },
    name: {
        type: String,
        required: true
    },
    species: {
        type: String,
        required: true
    },
    sex: {
        type: String, 
        required: true
    },
    birthday: {
        type: String, 
        required: true
    },
    weight: {
        type: Array,
        required: true
    }
});

PetsSchema.virtual('latestWeight').get(function() {
    if (`${this.weight.length}` > 1) {
      return `${this.weight.slice(-1)}`;
    }
    else 
    return `${this.weight}`});

PetsSchema.virtual('startingWeight').get(function() {
    if (`${this.weight.length}` > 1) {
        return `${this.weight[0]}`;
    }
    else 
    return `${this.weight}`});

PetsSchema.methods.apiRepr = function() {
    return {
        name: this.name || '',
        species: this.species || '',
        sex: this.sex || '',
        birthday: this.birthday || '',
        startingWeight: this.startingWeight,
        lastWeight: this.latestWeight,
    };
};


const Pet = mongoose.model('Pet', PetsSchema);

module.exports = {Pet};
