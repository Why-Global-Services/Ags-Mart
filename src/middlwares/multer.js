const multer = require('multer');
const storageMulter = multer.memoryStorage();

const fileFilter = function( req, file, cb){
    const allowedMimes = [
        'image/png',
        'image/jpg',
        'image/jpeg',
        'image/avif',
        'image/webp'
    ];
    if(allowedMimes.includes(file.mimetype)){
        cb(null, true);
    }
    else{
        cb(new Error('unspported filetype'),false)
    }
};
const uploads = multer({
    storage:storageMulter,
    fileFilter:fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }
})

module.exports = {uploads};