import React from 'react';
import logo from './assets/logo_2.jpg';
import FileUpload from './components/FileUpload';

import './App.css';



function App() {
  return (
    <div className='container'>
      <div className='row'>
        <div className="col-md-2"></div>
        <div className="col-md-8">
        <div>
          <img src={logo} style={{marginLeft: '15%', marginBottom:30, blockSize:100}}/>
        </div>
        <div>
        <FileUpload />
        </div>
        </div>
      </div>
    </div>
  );
}

export default App;