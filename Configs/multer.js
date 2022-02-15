const multer = require("multer");
const path = require("path")

module.exports = multer({
    storage:multer.diskStorage({}),
    fileFilter:(req,file,cb)=>{
        const ext = path.extname(file.originalname);
        if(ext !== ".png" && ext !== ".jpg" && ext !== ".jpeg" ){
            cb(new Error("File type is not supported"),false);
            return;
        }
        // convert to webp formate --> sharp
        cb(null,true)
    }
})