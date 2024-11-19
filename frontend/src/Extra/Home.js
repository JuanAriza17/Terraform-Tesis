import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../images/ciberseguridad.png"
const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="container-fluid bg-white text-black d-flex flex-column justify-content-center align-items-center mt-5 pt-5 mb-5 pb-5">
      <div className="row d-flex justify-content-center align-items-center">
        <div className="col-md-6 text-start">
          <h1 className="display-4 fw-bold">CyberLearn</h1>
          <p className="mt-3 text-secondary fs-5">
            Aprende ciberseguridad de forma práctica mediante retos CTF, máquinas virtuales interactivas y aprendizaje adaptativo.
          </p>
          <div className="row mt-5">
        <div className="col d-flex justify-content-center">
          <button
            className="btn btn-outline-dark me-3"
            onClick={() => navigate("/login")}
          >
            Iniciar Sesión
          </button>
          <button
            className="btn btn-outline-dark ms-3"
            onClick={() => navigate("/register")}
          >
            Registrarse
          </button>
        </div>
      </div>
        </div>
        {/* Logo a la derecha */}
        <div className="col-md-6 text-center">
          <img
            src={logo} // Cambia esta ruta por la ubicación de tu logo
            alt="Logo de la plataforma"
            className="img-fluid"

          />
        </div>
      </div>
      
    </div>
  );
};

export default Home;

