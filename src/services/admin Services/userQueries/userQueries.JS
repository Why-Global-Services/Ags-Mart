const {userQueriesSchema} = require("../../../models/userqueries");

const getAllUserQueries = async () => {
  try {
    const queries = await userQueriesSchema.find().sort({ createdAt: -1 });
    
    return { 
      status: true, 
      data: queries // Returns all fields including _id, timestamps
    };
  } catch (error) {
    return { status: false, message: error.message };
  }
};

module.exports = { getAllUserQueries };