import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

function Challenge() {
    const [inputFlags, setInputFlags] = useState([]);
    const [results, setResults] = useState([]);
    const [timer, setTimer] = useState(0);
    const [previousTime, setPreviousTime] = useState(0); // Para rastrear el tiempo del curso anterior
    const [loading, setLoading] = useState(false);


    const navigate = useNavigate();
    const location = useLocation();

    const { courses = [], flags = [], ips = [] } = location.state || {};  

    useEffect(() => {
        setInputFlags(Array(courses.length).fill(""));
        const interval = setInterval(() => setTimer((prev) => prev + 1), 1000);
        return () => clearInterval(interval);
    }, [courses]);

    const handleFlagChange = (index, value) => {
        const newFlags = [...inputFlags];
        newFlags[index] = value;
        setInputFlags(newFlags);
    };

    const verifyFlag = (index) => {
        const isCorrect = inputFlags[index] === flags[index];
        const currentTime = timer - previousTime; // Calcular el tiempo del curso actual
        if (isCorrect) {
            setResults((prev) => [...prev, { course: courses[index], time: currentTime, success: true }]);
            setPreviousTime(timer); // Actualizar el tiempo anterior al tiempo actual
        } else {
            alert("Flag incorrecta. ¡Sigue intentando!");
        }
    };

    const surrender = (index) => {
        const currentTime = timer - previousTime; // Calcular el tiempo del curso actual
        setResults((prev) => [...prev, { course: courses[index], time: currentTime, success: false }]);
        setPreviousTime(timer); // Actualizar el tiempo anterior al tiempo actual
    };
    
    const finishChallenge = async () => {
        setLoading(true);
        const workspace = localStorage.getItem("workspace");
        try {
          await axios.post('http://localhost:8000/destroy', 
            {workspace: workspace}, 
            {
              headers: {
                  "Authorization": `Bearer ${localStorage.getItem("token")}`,  // Incluye el token en los encabezados
                  "Content-Type": "application/json"
              }
          });
          navigate('/results', {state: { results }});  // Redirigir a la página de resultados
        } catch (error) {
            console.log('Error al destruir la máquina', error.response ? error.response.data : error.message);
        }
        finally
        {
          setLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <h2>Desafío de Cursos</h2>
            {courses.map((course, index) => {
                const result = results.find(result => result.course === course);
                const isCorrect = result && result.success;
                const isSurrendered = result && !result.success;
                const inputClass = isCorrect ? "form-control is-valid" : isSurrendered ? "form-control is-invalid" : "form-control";

                return (
                    <div key={index} className="mb-4">
                        <h3>
                            {course} <span className="badge bg-info">{ips[index]}</span> {/* Mostrar IP junto al curso */}
                        </h3>
                        <div className="input-group">
                            <input
                                type="text"
                                className={inputClass}
                                placeholder="Ingresa la flag"
                                value={inputFlags[index]}
                                onChange={(e) => handleFlagChange(index, e.target.value)}
                                disabled={isCorrect || isSurrendered} // Deshabilitar si se verificó o se rindió
                            />
                            <button 
                                onClick={() => verifyFlag(index)} 
                                className="btn btn-success" 
                                disabled={isCorrect || isSurrendered} // Deshabilitar si se verificó o se rindió
                            >
                                Verificar
                            </button>
                            <button 
                                onClick={() => surrender(index)} 
                                className="btn btn-danger" 
                                disabled={isCorrect || isSurrendered} // Deshabilitar si se verificó o se rindió
                            >
                                Rendirse
                            </button>
                        </div>
                        {result && (
                            <div className="mt-2">
                                <strong>Tiempo: {result.time} segundos</strong> {/* Mostrar tiempo específico para el curso */}
                            </div>
                        )}
                    </div>
                );
            })}
            <div className="mt-4">
                <h4>Tiempo: {timer} segundos</h4>
            </div>
            <button onClick={finishChallenge} disabled={loading} className="btn btn-primary mt-3">
                {loading ? "Finalizando..." : "Finalizar"}
            </button>
        </div>
    );
}

export default Challenge;
