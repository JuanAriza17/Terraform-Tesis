import React from 'react';
import Navbar from './Navbar'; // Importa la navbar

function Layout({ children }) {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />  {/* Navbar incluida */}
      <main className="flex-grow-1">
        <div className="container py-4">
          {children}
        </div>
      </main>
      <footer className="bg-dark text-white py-3 mt-auto">
        <div className="container text-center">
          <p>© 2024 Plataforma de Ciberseguridad - Todos los derechos reservados</p>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
