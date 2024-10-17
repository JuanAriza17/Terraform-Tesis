import React from 'react';
import { BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Login from "./Login";
import ProtectedPage from "./Protected";
import Layout from './Layout';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';

function App() {

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path='/' element={<Login />} />
          <Route path='/protected' element={<ProtectedPage />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App;

