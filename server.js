const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require("fs");
const Pool = require("pg").Pool;
const fastcsv = require("fast-csv");
const cors = require('cors');
const xlsx = require('node-xlsx');
const app = express();

app.use(fileUpload());
app.use(cors());

let file;
let tablename;

// Upload Endpoint
app.post('/upload', (req, res) => {
  if (req.files === null) {
    return res.status(400).json({ msg: 'No file uploaded' });
  }  
  let flag = -1;
  file = req.files.file;  
  tablename = req.body.tablename;  
  
  // Moving the xls file to directory.
  file.mv(`${__dirname}/client/public/uploads/${file.name}`, err => {
    if (err) {
      console.error(err);
      return res.status(500).send(err);
    }
    res.json({ fileName: file.name, filePath: `/uploads/${file.name}` });
  });
  
  // Converting xls to csv and uploading to postgress.
  fs.access(`${__dirname}/client/public/uploads/${file.name}`, fs.F_OK, (err) => {
    if (err) {
      console.error(err)
      return
    }
    
    let obj = xlsx.parse(`${__dirname}/client/public/uploads/${file.name}`);
    var rows = [];
    var writeStr = "";
    for(var i = 0; i < obj.length; i++)
      {
        var sheet = obj[i];
        //loop through all rows in the sheet
        for(var j = 0; j < sheet['data'].length; j++)
        {
          //add the row to the rows array
          rows.push(sheet['data'][j]);
        }
      }
    //creates the csv string to write it to a file
    for(var i = 0; i < rows.length; i++)
      {
        writeStr += rows[i].join(",") + "\n";
      }
    fs.writeFile(`${__dirname}/client/public/uploads/${tablename}.csv`, writeStr, function(err) {
      if(err) {
        return console.log(err);
      }
      console.log(`${tablename}.csv was saved in the current directory!`);
    });

    //sets flag to check if the file has been converted or not.
    flag = 1;
    
    // proceeds to upload the csv to pg server is it exists.
    if(flag) {
      fs.access(`${__dirname}/client/public/uploads/${tablename}.csv`, fs.F_OK, (err) => {
        if (err) {
          console.error(err)
          return
        }
        let stream = fs.createReadStream(`${__dirname}/client/public/uploads/${tablename}.csv`);
        let csvData = [];
        let headers = [];
        let csvStream = fastcsv
          .parse()
          .on("data", function(data) {
            csvData.push(data);
            headers = csvData[0];
          })
          .on("end", function() {
            // remove the first line: header
            csvData.shift();
          
            // create a new connection to the database
            const pool = new Pool({
              host: "localhost",
              user: "postgres",
              database: "postgres",
              password: "satan",
              port: 5432
            });
          
            const createQuery = 
              `CREATE TABLE ${tablename} (${headers.map((h) => `${h} VARCHAR`)})`;
            console.log(createQuery);
            const insertQuery =
            `INSERT INTO ${tablename} (${headers.map((h) => `${h}`)}) VALUES (${headers.map((h,i) => `$${i+1}`)})`;
          
            pool.connect((err, client, done) => {
              if (err) throw err;
              try {
                client.query(createQuery);
                csvData.forEach(row => {
                  client.query(insertQuery, row, (err, res) => {
                    if (err) {
                      console.log(err.stack);
                    } else {
                      console.log("inserted " + res.rowCount + " row:", row);
                    }
                  });
                });
              } finally {
                done();
              }
            });
          });
        stream.pipe(csvStream);
      })
    }  
  })
});

app.listen(5000, () => console.log('Server Started...'));