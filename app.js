
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');


const app = express();
const port = 3000;

// Configure multer to handle file uploads and specify the destination folder.
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
      if (file.fieldname === 'filepond') {
        // Handle folder uploads.
        const uploadPath = path.join(__dirname, 'uploads');
        fs.mkdirSync(uploadPath, { recursive: true });
        callback(null, uploadPath);
      } else {
        // Handle regular file uploads.
        callback(null, path.join(__dirname, 'uploads'));
      }
    },
    filename: (req, file, callback) => {
      callback(null, file.originalname);
    },
  });
  
  const upload = multer({ storage });




// Serve static files from the 'public' directory.
app.use(express.static(__dirname));

app.get("/",(req,res)=>{
  res.sendFile(path.join(__dirname,"/sidebars/index.html"))
})

// Handle file upload POST request.
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    // File uploaded successfully.
    res.redirect('/');

 

});


app.get('/listfiles', (req, res) => {
    const uploadDir = path.join(__dirname, 'uploads');

    // Use the 'fs' module to read the contents of the uploads folder.
    fs.readdir(uploadDir, (err, files) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Unable to read the uploads folder.' });
        }

        // Send the list of files as JSON to the client.
        res.json({ files });
    });
});


function getFileType(fileName) {
    const extension = fileName.toLowerCase().split('.').pop();
    switch (extension) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return 'Image';
      case 'pdf':
        return 'PDF';
      case 'doc':
      case 'docx':
        return 'Word Document';
      case 'xls':
      case 'xlsx':
        return 'Excel Spreadsheet';
      case 'ppt':
      case 'pptx':
        return 'PowerPoint Presentation';
      // Add more extensions as needed
      default:
        return 'File';
    }
  }
  

  app.get('/listuploads', (req, res) => {
    const uploadDir = path.join(__dirname, 'uploads');

   
    fs.readdir(uploadDir, { withFileTypes: true }, (err, items) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Unable to read the uploads folder.' });
      }
  
      // Get file and folder details (name, type, size).
      const fileDetails = items.map((item) => {


        const name = item.name;
        const type = getFileType(name)
        const size = fileSize(item)
  
        return {
          name,
          type,
          size,
        };
      });
  
      res.json({ files: fileDetails });
    });
  });
  
  // Helper function to format file size.
  function fileSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
  }

// Start the server.
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

