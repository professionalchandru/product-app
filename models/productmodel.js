const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    category: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    description: {
        type: String
    },
    insertedAt: {
        type: Date,
        default: Date.now
    },
    // likes: {
    //     type: Number
    // },
    likedBy: {
        type: Array
    }
});

module.exports = mongoose.model('Products', productSchema);