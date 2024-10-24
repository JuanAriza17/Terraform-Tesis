import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function Loading() {
    const navigate = useNavigate();
    const location = useLocation();
    const { courses = [], flags = [], ips = [] } = location.state || {};  

    useEffect(() => {
        // Simular la carga por un tiempo determinado (ajusta el tiempo como desees)
        const loadingDuration = 5000;  // 3 segundos de espera

        setTimeout(() => {
            // Navegar a la página de desafío y pasar los cursos y flags
            navigate('/challenge', { state: { courses, flags, ips } });
        }, loadingDuration);
    }, [navigate, courses, flags, ips]);

    return (
        <div className="d-flex justify-content-center align-items-center vh-100">
            <div className="text-center">
                <h2 className="display-4">Cargando...</h2>
                <div className="spinner-border" role="status" style={{ width: '5rem', height: '5rem' }}>
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        </div>
    );
}

export default Loading;
