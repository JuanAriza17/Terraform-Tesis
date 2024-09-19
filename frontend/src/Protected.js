import React, { useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { nanoid } from 'nanoid';

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
            console.log(token);
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
        console.log(courses)
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

export default ProtectedPage;