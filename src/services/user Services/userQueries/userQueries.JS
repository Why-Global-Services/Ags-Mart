const { userQueriesSchema } = require("../../../models/userqueries");

const createUserQuery = async (req) => {
    const { name, email, phone, message } = req.body;
    
    if (!name || !email || !phone || !message) {
      return { status: false, message: "All fields are required" };
    }

    const newQuery = await userQueriesSchema.create({
      name,
      email,
      phone,
      message
    });

    return { 
      status: true, 
      message: "Query submitted successfully",
      data: {
        name: newQuery.name,
        email: newQuery.email,
        phone: newQuery.phone,
        message: newQuery.message
      }
    };

};

module.exports = { createUserQuery };