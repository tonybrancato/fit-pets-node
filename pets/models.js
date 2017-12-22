const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
const moment = require('moment');

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
		// weights: [{
		// 	weight: String,
		// 	weightDate: String,
		// }],
		weight: {
			type: Array,
			required: true
		},
    weightDate: {
        type: Array,
        required: true
		},
		tricks: {
			type: Array
		}
});

PetsSchema.virtual('age').get(function() {
	const now = moment();
	const birthday = moment(this.birthday);
	const age = now.diff(birthday, 'months');
	if (age < 1) {
		const ageDays = now.diff(birthday, 'days');
		return `${ageDays} day`
	}
	if (age >= 12) {
		const ageYears = now.diff(birthday, 'years');
		return `${ageYears} year`
	}
	else 
	return `${age} month`
});

PetsSchema.virtual('latestWeight').get(function() {
	if (`${this.weight.length}` > 1) {
		return `${this.weight.slice(-1)}`;
	}
	else 
	return `${this.weight}`
});

PetsSchema.virtual('startingWeight').get(function() {
	if (`${this.weight.length}` > 1) {
			return `${this.weight[0]}`;
	}
	else 
	return `${this.weight}`
});

PetsSchema.methods.apiRepr = function() {
	return {
		name: this.name || '',
		species: this.species || '',
		sex: this.sex || '',
		birthday: this.birthday || '',
		age: this.age,
		weight: this.weight,
		weightDate: this.weightDate,
		startingWeight: this.startingWeight,
		lastWeight: this.latestWeight,
		tricks: this.tricks
	};
};


const Pet = mongoose.model('Pet', PetsSchema);

module.exports = {Pet};
