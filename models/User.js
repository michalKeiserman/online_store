const mongoose = require('mongoose');
const schema = mongoose.Schema;

const userSchema = new schema({
    email:{
        type: String,
        required: true,
        unique: true,
    },
    password:{
        type: String,
        required: true,
    },
    cart:{
        type: Array
    },
    login:{
        type: Array
    },
    admin:{
        type: Boolean,
    },
    wallet:{
        type: Number
    },
    logout:{
        type: Array
    },
    purchases:{
        type: Array
    },
    messages:{
        type: Array,
    }
});

module.exports = mongoose.model("User",userSchema); //export as a model with name "User" and pass it the user schema





