// ⭐ 1. NORMAL FUNCTION (generate guestId)
const generateGuestId = () => {
  return (
    "POVII-" +
    Date.now() +
    "-" +
    Math.random().toString(36).substring(2, 8).toUpperCase()
  );
};


const getOrCreateGuestId = (req, res, next) => {
  let guestId = req.headers.guestid;  
  if (!guestId) {
    guestId = generateGuestId(); 
  }

  req.guestId = guestId; 

  next(); 
};

module.exports = {
  generateGuestId,
  getOrCreateGuestId,
};
