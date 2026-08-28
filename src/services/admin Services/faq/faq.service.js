const { BAD_REQUEST, NOT_FOUND } = require("http-status");
const {FAQ} = require("../../../models/faq.model"); // Adjust this if you use named exports
const ApiError = require("../../../utils/apiError");

const faqData = async (req, res, next) => {
    const { question, answer } = req.body;

    if (!question || !answer) {
      throw new ApiError(BAD_REQUEST, "Missing question or answer");
    }

    const faqItem = {
      question,
      answer,
    };

    let existingFaq = await FAQ.findOne();

    if (!existingFaq) {
      const createdFaq = await FAQ.create({ faq: [faqItem] }); // fixed field name
      return{ success: true, message: "FAQ created", data: createdFaq }
    }

    existingFaq.faq.push(faqItem);
    const updatedFaq = await existingFaq.save();

    return { success: true, message: "FAQ updated", data: updatedFaq }
};

const getFAQ = async(req, res)=>{
    const FetchedFAQ = await FAQ.findOne()

    if(!FetchedFAQ){
        throw new ApiError(NOT_FOUND, "No FAQ found add FAQ")
    }

    return {success: true, message: "Fetched FAQ", data: FetchedFAQ}
}

const deleteFAQ = async(req, res)=>{
  const {index} = req.query;

  if(!index){
    throw new ApiError(BAD_REQUEST, "No index provided")
  }

  const fetchedFAQ = await FAQ.findOne()

  const filtered = fetchedFAQ.faq.filter((item, ind)=> ind != index )

  fetchedFAQ.faq = filtered;

  await fetchedFAQ.save();

  return {success: true, message: "FAQ Deleted successfully", data: fetchedFAQ}
}

module.exports = {
  faqData,
  getFAQ,
  deleteFAQ
};
