import React from 'react';
import { useLocation } from 'react-router-dom';


function Results() {
    
    const location = useLocation();
    const { results = [] } = location.state || {};  // Recuperar los resultados

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
        </div>
    );
}

export default Results;
