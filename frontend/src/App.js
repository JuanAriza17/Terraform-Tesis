import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [courses, setCourses] = useState([""]);
  const [instanceCount, setInstanceCount] = useState(1);
  const [message, setMessage] = useState('');
  const [output, setOutput] = useState([]);
  const [loading, setLoading] = useState(false);

  const addCourse = () => {
    setCourses([...courses, ""])
  }

  const handleCourseChange = (index, value) => {
    const newCourses = [...courses];
    newCourses[index] = value;
    setCourses(newCourses)
  }

  const handleDeploy = async () => {
    setLoading(true);
    try {
      console.log(courses)
      const response = await axios.post('http://localhost:8000/deploy', {
        courses: courses.slice(0, instanceCount),
        instance_count: instanceCount,
      });
      setOutput(response.data.ip)
      setMessage(response.data.message);
    } catch (error) {
      setOutput(["X.X.X.X"])
      setMessage('Error al desplegar la máquina');
    }
    finally{
      setLoading(false);
    }
  };

  const handleDestroy = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/destroy');
      setOutput([])
      setMessage(response.data.message);
    } catch (error) {
      setMessage('Error al destruir la máquina');
    }
    finally
    {
      setLoading(false);
    }
  };


  return (
    <div>
      <h1>Desplegar Curso de Ciberseguridad</h1>
      {courses.map((course, index) => (
        <div key={index}>
          <label>
            Curso {index + 1}:
            <input
              type="text"
              value={course}
              onChange={(e) => handleCourseChange(index, e.target.value)}
            />
          </label>
          <br />
        </div>
      ))}
      <button onClick={addCourse}>Añadir otro curso</button>
      <br />
      <label>
        Número de instancias:
        <input
          type="number"
          value={instanceCount}
          onChange={(e) => setInstanceCount(Number(e.target.value))}
          min="1"
        />
      </label>
      <br />
      <button onClick={handleDeploy} disabled={loading}>
        {loading ? "Desplegando..." : "Desplegar"}
      </button>
      <button onClick={handleDestroy} disabled={loading}>
        {loading ? "Destrozando..." : "Destruir"}
      </button>
      <h2>{message}</h2>
      <h2>Direcciones IP Públicas:</h2>
      <ul>
        {output.length > 0 ? (
          output.map((ip, index) => <li key={index}>{ip}</li>)
        ) : (
          <li>No hay IPs disponibles</li>
        )}
      </ul>
    </div>
  );
}

export default App;

