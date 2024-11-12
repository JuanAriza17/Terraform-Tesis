import React from 'react';
import { BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Login from "./Auth/Login";
import Register from "./Auth/Register";
import Protected from "./Platform/Protected";
import Home from "./Platform/Home";
import Layout from './Extra/Layout';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import ProtectedRoute from './Auth/ProtectedRoute';
import Loading from './Extra/Loading';
import Challenge from './Platform/Challenge';
import Results from './Platform/Results';
import Courses from './Courses/Courses';
import CreateCourse from './Courses/CreateCourse';

function App() {

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          
          <Route path='/protected' element={
            <ProtectedRoute>
              <Protected />
            </ProtectedRoute>
            } />
          <Route path='/loading' element={
            <ProtectedRoute>
              <Loading />
            </ProtectedRoute>
            } />
          <Route path='/challenge' element={
            <ProtectedRoute>
              <Challenge />
            </ProtectedRoute>
            } />
          <Route path='/results' element={
            <ProtectedRoute>
              <Results />
            </ProtectedRoute>
            } />
          <Route path='/courses' element={
            <Courses />
            } />
          <Route path='/create-course' element={
            <ProtectedRoute>
              <CreateCourse />
            </ProtectedRoute>
            } />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App;

