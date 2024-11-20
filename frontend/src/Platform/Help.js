import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import logo from "../images/ciberseguridad.png"

const AboutUs = () => {
  return (
    <div className="container mt-5" style={{ color: "#000", backgroundColor: "#fff", padding: "2rem", borderRadius: "8px" }}>
      <div className="text-center">
        <img
          src={logo} // Reemplaza con la ruta de tu logo
          alt="CyberLearn Logo"
          style={{ maxWidth: "150px" }}
          className="mb-4"
        />
        <h1 className="display-4" style={{ fontWeight: "bold" }}>Sobre CyberLearn</h1>
        <p className="lead mt-3" style={{ fontSize: "1.2rem" }}>
          CyberLearn es una plataforma dedicada a enseñar ciberseguridad a través de desafíos prácticos tipo <strong>CTF</strong> (Capture the Flag). Diseñada para fomentar el aprendizaje interactivo, la plataforma permite a los usuarios desarrollar habilidades críticas en un entorno seguro y profesional.
        </p>
      </div>

      <div className="mt-5">
        <h3 style={{ borderBottom: "2px solid #000", paddingBottom: "0.5rem" }}>¿Cómo lo logramos?</h3>
        <p style={{ fontSize: "1.1rem", lineHeight: "1.6", textAlign: "justify" }}>
          Hemos creado un entorno flexible y escalable para desplegar retos personalizados, utilizando tecnologías como React para el frontend, FastAPI para el backend y Terraform en AWS. Cada curso simula escenarios reales y ofrece una experiencia educativa única. Además, implementamos un sistema de recomendación basado en machine learning que analiza el progreso y comportamiento de los usuarios, sugiriendo retos o áreas de aprendizaje adaptados a sus intereses y necesidades, permitiendo un camino de aprendizaje optimizado en ciberseguridad.
        </p>
      </div>

      <footer className="mt-5 text-center">
        <p className="mb-0" style={{ fontSize: "1rem", color: "#333" }}>
          Desarrollado por <strong>Juan Andrés Ariza Gacharná</strong>.
        </p>
      </footer>
    </div>
  );
};

export default AboutUs;
