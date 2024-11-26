import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import qs from 'qs';

function Loading() {
    const navigate = useNavigate();
    const location = useLocation();
    const { courses = [], flags = [], ips = [], ids = [], course_ids = [] } = location.state || {};
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const checkMachinesInitialization = async () => {
            try {
                const response = await axios.get('http://localhost:8000/check_instances/', {
                    params: { instance_ids: ids },
                    paramsSerializer: params => {
                        return qs.stringify(params, {arrayFormat: 'repeat'})
                      }
                });// Llamada al backend
                if (response.data.initialized) {
                    setIsInitialized(true); // Si todas las instancias están inicializadas
                }
            } catch (error) {
                console.log(error.response.data);
            }
        };

        const intervalId = setInterval(checkMachinesInitialization, 5000); // Revisa cada 5 segundos
        return () => clearInterval(intervalId); // Limpiar el intervalo cuando el componente se desmonte
    }, [ids]);

    useEffect(() => {
        if (isInitialized) {
            // Navegar a la página de desafío y pasar los cursos y flags cuando las máquinas estén inicializadas
            navigate('/challenge', { state: { courses, flags, ips, course_ids } });
        }
    }, [isInitialized, navigate, courses, flags, ips, course_ids]);

    return (
        <div className="d-flex justify-content-center align-items-center">
            <div className="text-center align-items-center mt-5 pt-5">
                <h2 className="display-4">Cargando...</h2>
                <div className="spinner-border" role="status" style={{ width: '5rem', height: '5rem' }}>
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        </div>
    );
}

export default Loading;
