import React, { useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { nanoid } from 'nanoid';
import 'bootstrap/dist/css/bootstrap.min.css';


function ProtectedPage() {

    const [courses, setCourses] = useState([""]);
    const [flags, setFlags] = useState([""]);
    const [instanceCount, setInstanceCount] = useState(1);
    const [message, setMessage] = useState('');
    const [output, setOutput] = useState([]);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const verifyToken = async () => {
            const token = localStorage.getItem("token");
            try {
                const response = await axios.get(`http://localhost:8000/auth/verify-token/${token}`);
    
                const responseOK = response && response.status === 200 && response.statusText === 'OK';
                if (!responseOK) {
                    throw new Error('Token verification failed')
                }
    
            } catch (error) {
                localStorage.removeItem("token");
                navigate("/");
            }
        };

        verifyToken();
    }, [navigate]);
  
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
      const newFlags = Array.from({length: instanceCount}, () => nanoid(16));
      setFlags(newFlags);
      try {
        console.log(flags)
        const response = await axios.post('http://localhost:8000/deploy', {
          courses: courses.slice(0, instanceCount),
          instance_count: instanceCount,
          flags: flags.slice(0, instanceCount),
        }, 
        {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`,  // Incluye el token en los encabezados
                "Content-Type": "application/json"
            }
        }
      );
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
        const response = await axios.post('http://localhost:8000/destroy', {}, {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`,  // Incluye el token en los encabezados
                "Content-Type": "application/json"
            }
        });
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
        
        <div className="form-group mb-3">
          <label>Número de instancias:</label>
          <input
            type="number"
            className="form-control"
            value={instanceCount}
            onChange={(e) => setInstanceCount(Number(e.target.value))}
            min="1"
            disabled={loading}
          />
        </div>
        
        <div className="d-flex gap-2">
          <button className="btn btn-primary" onClick={handleDeploy} disabled={loading}>
            {loading ? "Desplegando..." : "Desplegar"}
          </button>
          <button className="btn btn-danger" onClick={handleDestroy} disabled={loading}>
            {loading ? "Destrozando..." : "Destruir"}
          </button>
        </div>

        <h2 className="mt-4">{message}</h2>

        <h2 className="mt-4">Direcciones IP Públicas:</h2>
        <ul className="list-group">
          {output.length > 0 ? (
            output.map((ip, index) => (
              <li className="list-group-item" key={index}>
                {ip}
              </li>
            ))
          ) : (
            <li className="list-group-item">No hay IPs disponibles</li>
          )}
        </ul>
      </div>
    );
}

export default ProtectedPage;