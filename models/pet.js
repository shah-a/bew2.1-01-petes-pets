"use strict";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const mongoosePaginate = require('mongoose-paginate');

mongoosePaginate.paginate.options = {
  limit: 3 // records per page
};

const PetSchema = new Schema({
  name: { type: String, required: true },
  species: { type: String, required: true },
  birthday: { type: Date, required: true },
  picUrl: { type: String },
  picUrlSq: { type: String },
  avatarUrl: { type: String, required: true },
  favoriteFood: { type: String, required: true },
  description: { type: String, minlength: 140, required: true },
  price: { type: Number, required: true }
}, { timestamps: true });

PetSchema.plugin(mongoosePaginate);

PetSchema.index({
  name: 'text', species: 'text', favoriteFood: 'text', description: 'text'
}, {
  name: 'My text index',
  weights: {
    name: 10,
    species: 4,
    favoriteFood: 2,
    description: 1
  }
});

module.exports = mongoose.model('Pet', PetSchema);
