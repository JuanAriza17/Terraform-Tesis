import React from 'react';
import { BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Login from "./Auth/Login";
import Register from "./Auth/Register";
import Protected from "./Platform/Protected";
import Home from "./Platform/Home";
import Layout from './Extra/Layout';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';

function App() {

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/protected' element={<Protected />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App;

