const testimonial = require('../../../models/testimonial.model')
const { uploadToCloud } = require('../../../utils/uploadFileToS3')
const ApiError = require("../../../utils/apiError")

// Create Testimonial
const createTestimonial = async(req,res)=>{
    const data = req.body;
    if(!data){
        throw new ApiError(400, "all data is required")
    }
   
    const createData = { ...data }
    const testimonialData = await testimonial.create(createData)
    if(!testimonialData){
        throw new ApiError(400, "Not create data")
    }

return {
    sucess: true,
    message: "Sucessfull",
    data: testimonialData
}

}

const getTestimonial = async(req,res)=>{
    const data = await testimonial.find();
    if(!data){
        throw new ApiError(404, "Data is not retrive")
    }
    return {
    sucess: true,
    message: "data get Sucessfull",
    data: data
}
}


module.exports = { createTestimonial, getTestimonial }