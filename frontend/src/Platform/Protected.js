import React, { useState} from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { nanoid } from 'nanoid';
import 'bootstrap/dist/css/bootstrap.min.css';


function ProtectedPage() {

    const [courses, setCourses] = useState([""]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

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
      const newFlags = courses.map(() => nanoid(16));  // Crear flags dinámicas para cada curso
      try {
          const response = await axios.post('http://localhost:8000/deploy', {
              courses: courses,
              flags: newFlags,
          }, {
              headers: {
                  "Authorization": `Bearer ${localStorage.getItem("token")}`,
                  "Content-Type": "application/json",
              }
          });
          setMessage("Cursos desplegados");

          // Navegar a la página de carga y pasar los datos de cursos y flags
          navigate('/loading', { state: { courses: courses, flags: newFlags, ips: response.data.ip } });
      } catch (error) {
          setMessage('Error al desplegar las máquinas');
      } finally {
          setLoading(false);
      }
  };

    return (
      <div className="container mt-5">
          <h1 className="text-center mb-4">Desplegar Curso de Ciberseguridad</h1>
          
          {courses.map((course, index) => (
              <div className="form-group mb-3" key={index}>
                  <label>Curso {index + 1}:</label>
                  <input
                      type="text"
                      className="form-control"
                      value={course}
                      onChange={(e) => handleCourseChange(index, e.target.value)}
                  />
              </div>
          ))}
          
          <button className="btn btn-secondary mb-3" onClick={addCourse} disabled={loading}>
              Añadir otro curso
          </button>
          
          <div className="d-flex gap-2">
              <button className="btn btn-primary" onClick={handleDeploy} disabled={loading}>
                  {loading ? "Desplegando..." : "Desplegar"}
              </button>
          </div>

          <h2 className="mt-4">{message}</h2>
      </div>
  );
}

export default ProtectedPage;