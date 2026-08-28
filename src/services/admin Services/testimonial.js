const testimonial = require('../../models/testimonial.model')
const { uploadToCloud } = require('../../utils/uploadFileToS3')
const ApiError = require("../../utils/apiError")

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
        return {
    sucess: false,
    message: "No Data Found",
    data: data
    }
}
    return {
    sucess: true,
    message: "data get Sucessfull",
    data: data
}
}

const updateTestimonial =async(req,res)=>{
    const id = req.params.id
    const data = req.body
    if(!data){
         throw new ApiError(404, "Data is not retrive")
    }
    const existing = await testimonial.findById(id)
    if(!existing){
        throw new ApiError(404, "Data is not found")
    }
    const updatedData = await testimonial.findByIdAndUpdate(id,{...data},{new: true})
    return {
        sucess: true,
        message: "data is updated",
        data: updatedData
    }
}

const deleteTestimonial =async(req,res)=>{
    const id = req.params.id
    if(!id){
         throw new ApiError(404, "ID is not retrive")
    }
    const updatedData = await testimonial.findByIdAndDelete(id)
    return {
        sucess: true,
        message: "data is deleted",
    }
}

module.exports = { createTestimonial, getTestimonial, updateTestimonial,deleteTestimonial }