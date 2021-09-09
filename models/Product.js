const mongoose = require('mongoose');
const schema = mongoose.Schema;

const productSchema = new schema({
    name:{
        type: String,
    },
    price:{
        type: Number,
    },
    photo:{
        type: String,
    },
    quantity:{
        type: Number,
    }
});

module.exports = mongoose.model("Product", productSchema);