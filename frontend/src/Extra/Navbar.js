import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from "../images/logo.png"

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('workspace');
    localStorage.removeItem('id');
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid">
        <Link className="navbar-brand" to={localStorage.getItem("token")?"/principal":"/"}><img src={logo} alt="logo" style={{ height: '40px', width: 'auto' }}/> CyberLearn</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {token && (
              <li className="nav-item">
                <Link className="nav-link" to="/dashboard">Dashboard</Link>
              </li>
            )}
            <li className="nav-item">
              <Link className="nav-link" to="/courses">Cursos</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/help">Sobre nosotros</Link>
            </li>
          </ul>
          {token ? (
            <ul className="navbar-nav">
              <li className="nav-item"><button className="nav-link" onClick={handleLogout}>Cerrar sesión</button></li>
            </ul>
            
          ) : (
            <ul className="navbar-nav">
              <li className="nav-item">
                <Link className="nav-link" to="/login">Iniciar sesión</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/register">Registrarse</Link>
              </li>
            </ul>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
