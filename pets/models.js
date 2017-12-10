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
    weight: [{
        type: Number,
        required: true
    }]
});

PetsSchema.methods.apiRepr = function() {
    return {
        name: this.name || '',
        species: this.species || '',
        sex: this.sex || '',
        birthday: this.birthday || '',
        weight: this.weight || '',
    };
};


const Pet = mongoose.model('Pet', PetsSchema);

module.exports = {Pet};
