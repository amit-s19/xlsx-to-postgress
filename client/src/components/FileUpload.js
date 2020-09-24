import React, { Fragment, useState } from 'react';
import Message from './Message';
import Progress from './Progress';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField'
import { CsvToHtmlTable } from 'react-csv-to-table';
import axios from 'axios';
import xlsx from 'node-xlsx';
import './FileUpload.css';;

const useStyles = makeStyles((theme) => ({
  formControl: {
    marginLeft: theme.spacing(0),
    marginBottom: theme.spacing(3),
    width: '100%',
  },
}));

const FileUpload = (props) => {
  const [file, setFile] = useState('');
  const [filename, setFilename] = useState('Choose File');
  const [tablename, setTablename] = useState('dummyTable');
  const [uploadedFile, setUploadedFile] = useState({});
  const [message, setMessage] = useState('');
  const [uploadPercentage, setUploadPercentage] = useState(0);
  const classes = useStyles();

  const onChange = e => {
    setFile(e.target.files[0]);
    setFilename(e.target.files[0].name);
  };

  const handleChange1 = (event) => {
    setTablename(event.target.value);
  };

  const onSubmit = async e => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('tablename', tablename);
    try {
      const res = await axios.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: progressEvent => {
          setUploadPercentage(
            parseInt(
              Math.round((progressEvent.loaded * 100) / progressEvent.total)
            )
          );
        }
      });

      const { fileName, filePath } = res.data;
      setUploadedFile({ fileName, filePath });    
      setMessage('Table created successfully.');

    } catch (err) {
      if (err.response.status === 500) {
        setMessage('There was a problem with the server');
      } else {
        setMessage(err.response.data.msg);
      }
    }
  };
  function renderTable() {}
  return (
    <Fragment>
      <TextField
        fullWidth
        label="Enter Table name"
        name="tablename"
        variant="outlined"
        onChange={handleChange1}
        value={tablename}
        size="small"
        className={classes.root}
      />              
      <form onSubmit={onSubmit}>       
        <div className='custom-file mb-4'>
          <input
            type='file'
            className='custom-file-input'
            id='customFile'
            onChange={onChange}
          />
          <label className='custom-file-label' htmlFor='customFile'>
            {filename}
          </label>
        </div>
        <input
          type='submit'
          value='Create Table'
          className='btn btn-primary btn-block mt-4'
        />
      </form>

      <div className="progres-bar">
        <Progress percentage={uploadPercentage} />
      </div>
      {message ? <Message msg={message} /> : null}

      {uploadedFile ? renderTable = () => {
        let obj = xlsx.parse(uploadedFile.filePath);
        var rows = [];
        var writeStr = "";
        for(var i = 0; i < obj.length; i++) {
          var sheet = obj[i];
          for(var j = 0; j < sheet['data'].length; j++)
            rows.push(sheet['data'][j]);
        }
        for(var i = 0; i < rows.length; i++)
          writeStr += rows[i].join(",") + "\n";
        return (
          <CsvToHtmlTable
            data={writeStr}
            csvDelimiter=","
            tableClassName="table table-striped table-hover"
          />
        )
      } : null}
    </Fragment>
    
  );
};


export default FileUpload;


/*
Develop an activity diagram based on the following narrative.  The purpose of the Open Access
Insurance System is to provide automotive insurance to car owners.  Initially, prospective customers
fill out an insurance application, which provides information about the customer and his or her vehicles.
This information is sent to an agent, who sends it to various insurance companies to get quotes for
insurance.  When the responses return, the agent then determines the best policy for the type and
 level of coverage desired and gives the customer a copy of the insurance policy proposal and quote.  
*/


/*



*/