const express = require("express");
const bodyParser = require("body-parser");
const fileUpload = require('express-fileupload');
const cors = require("cors");

const app = express();

app.use(express.static('images'));

var corsOptions = {
    origin: "http://localhost:3000"
};
app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

app.use(fileUpload({
    createParentPath: true
}));

// simple route
app.get("/", (req, res) => {
  res.json({ message: "test text here" });
});

app.post('/upload-image', async (req, res) => {
    try {
        if(!req.files) {
            res.send({
                status: false,
                message: 'File not uploaded'
            });
        } else {
            //Use the name of the input field (i.e. "avatar") to retrieve the uploaded file
            const image = req.files.image;

            //Use the mv() method to place the file in upload directory (i.e. "uploads")
            image.mv('./images/' + image.name);

            //send response
            res.send({
                status: true,
                message: 'File is uploaded',
                data: {
                    name: image.name,
                    mimetype: image.mimetype,
                    size: image.size
                }
            });
        }
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});

// set port, listen for requests
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
