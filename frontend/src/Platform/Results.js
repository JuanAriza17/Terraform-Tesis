import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';

function Results() {
    
    const location = useLocation();
    const { results = [] } = location.state || {};  // Recuperar los resultados
    const navigate = useNavigate();

    return (
        <div className="container mt-5">
            <h2>Resultados Finales</h2>
            <ul className="list-group">
                {results.map((result, index) => (
                    <li className="list-group-item" key={index}>
                        {result.course}: {result.success ? `Completado en ${result.time} segundos` : "No completado"}
                    </li>
                ))}
            </ul>
            <div className='d-flex justify-content-center '>
                <Button variant="success" onClick={() => navigate("/principal")} className="mt-4" size="lg">Volver al Inicio</Button>
            </div>

        </div>
    );
}

export default Results;
