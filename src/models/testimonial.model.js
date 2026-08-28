const mongoose = require('mongoose')

const testimonilaScehma = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    productName:{
        type:String,
        required:true
    },
    rating:{
        type: Number,
        min:1,
        max:5,
        required:true
    },
    comments:{
        type: String,
        minlength:10,
    },
},
    { timestamps: true, collection: 'testimonials' },
)

const testimonials = mongoose.model("testimonials", testimonilaScehma)
module.exports = testimonials