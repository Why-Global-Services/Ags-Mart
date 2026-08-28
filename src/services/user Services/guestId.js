const { generateGuestId } = require("../../utils/guestId")

const idGenerator = async(req,res)=>{
    const data = await generateGuestId()
    return data
}

module.exports = {
    idGenerator,
};