import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button, Container, ListGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaTimes } from 'react-icons/fa';

const CreateCourse = () => {
  const [title, setTitle] = useState('');
  const [alias, setAlias] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('');
  const [team, setTeam] = useState('');
  const [difficulty, setDifficulty] = useState(1);
  const [estimatedTime, setEstimatedTime] = useState(0);
  const [files, setFiles] = useState([]);
  
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {

    const verifyPermissions = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/auth/verify-profesor-admin/${token}`);
        const cumple = response?.data?.message === "User is professor or admin";
        return cumple;
      } catch (err) {
        console.log(err);
      }
    }

    const cumple = verifyPermissions();
    
    // Verificar si el usuario tiene el rol adecuado
    if (!cumple) {
      // Redirigir a la página de cursos si el usuario no tiene el rol adecuado
      navigate('/courses');
    }
  }, [navigate, token]);

  const handleFileChange = (e) => {
    console.log(e.target.files)
    setFiles(e.target.files);
  };

  const handleRemoveFile = (index) => {
    // Elimina el archivo de la lista por índice
    setFiles((prevFiles) => Array.from(prevFiles).filter((file, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', title);
    formData.append('alias', alias);
    formData.append('description', description);
    formData.append('type', type);
    formData.append('team', team);
    formData.append('difficulty', difficulty);
    formData.append('estimated_time', estimatedTime);

    Array.from(files).forEach((file) => {
      formData.append('files', file);
    });

    try {
      await axios.post('http://localhost:8000/courses/', formData, {
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/form-data",
        },
      });
      navigate('/courses');
    } catch (error) {
      console.log(error.response)
      console.error('Error al crear el curso:', error);
    }
  };

  return (
    <Container className="mt-4">
      <h3>Crear un Curso</h3>
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="formTitle">
          <Form.Label>Título</Form.Label>
          <Form.Control
            type="text"
            placeholder="Ingrese el título del curso"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group controlId="formTitle">
          <Form.Label>Nombre de la carpeta</Form.Label>
          <Form.Control
            type="text"
            placeholder="Ingrese el nombre de la carpeta"
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group controlId="formDescription">
          <Form.Label>Descripción</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group controlId="formType">
          <Form.Label>Tipo</Form.Label>
          <Form.Control
            type="text"
            value={type}
            onChange={(e) => setType(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group controlId="formTeam">
          <Form.Label>Team</Form.Label>
          <Form.Control
            type="text"
            value={team}
            onChange={(e) => setTeam(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group controlId="formDifficulty">
          <Form.Label>Dificultad</Form.Label>
          <Form.Control
            type="number"
            min="1"
            max="5"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group controlId="formEstimatedTime">
          <Form.Label>Tiempo Estimado</Form.Label>
          <Form.Control
            type="number"
            value={estimatedTime}
            onChange={(e) => setEstimatedTime(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group controlId="formFiles">
          <Form.Label>Archivos</Form.Label>
          <Form.Control
            type="file"
            multiple
            onChange={handleFileChange}
            required
          />
        </Form.Group>

        {/* Mostrar los archivos seleccionados */}
        {files.length > 0 && (
          <div className="mt-3">
            <h5>Archivos Seleccionados:</h5>
            <ListGroup>
              {Array.from(files).map((file, index) => (
                <ListGroup.Item key={index} className="d-flex justify-content-between">
                  <span>{file.name}</span>
                  <span
                    onClick={() => handleRemoveFile(index)}
                    style={{
                      color: 'red',
                      cursor: 'pointer',
                      fontSize: '20px', // Tamaño del ícono
                    }}
                  >
                    <FaTimes />
                  </span>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </div>
        )}

        <Button variant="primary" type="submit" className="mt-3">
          Crear Curso
        </Button>
      </Form>
    </Container>
  );
};

export default CreateCourse;
