import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, Button, Container, Row, Col, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom'; 

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [sortCriteria, setSortCriteria] = useState('title'); // Criterio inicial de orden

  const navigate = useNavigate(); 

  const userRole = localStorage.getItem('role'); // Obtener el rol desde localStorage

  useEffect(() => {
    axios.get('http://localhost:8000/courses/all')
      .then(response => {
        setCourses(sortCourses(response.data, sortCriteria));
      })
      .catch(error => console.error("Error loading courses:", error));
  }, [sortCriteria]);

  // Función para ordenar cursos
  const sortCourses = (courses, criteria) => {
    return [...courses].sort((a, b) => {
      switch (criteria) {
        case 'difficulty':
          return a.difficulty - b.difficulty;
        case 'type':
          return a.type.localeCompare(b.type);
        case 'team':
          return a.team.localeCompare(b.team);
        case 'estimatedTime':
          return a.estimated_time - b.estimated_time;
        case 'title':
        default:
          return a.title.localeCompare(b.title);
      }
    });
  };

  // Actualiza los cursos al cambiar el criterio de ordenamiento
  const handleSortChange = (e) => {
    setSortCriteria(e.target.value);
    setCourses(sortCourses(courses, e.target.value));
  };

  const getTeamColor = (team) => {
    switch (team) {
      case 'RED':
        return '#f28b82'; // Rojo pastel
      case 'BLUE':
        return '#aecbfa'; // Azul pastel
      case 'PURPLE':
        return '#cca9dd'; // Verde pastel
      default:
        return '#ffffff'; // Blanco neutro
    }
  };

  const renderDifficultyStars = (difficulty) => {
    return '★'.repeat(difficulty) + '☆'.repeat(5 - difficulty);
  };

  const isSelected = (course) => selectedCourse && selectedCourse.id === course.id;

  const handleCreateCourse = () => {
    // Redirige a la página para crear un curso
    navigate('/create-course');
  };

  return (
    <Container className="mt-4">
        {/* Botón de Crear Curso */}
      <Row className="mb-3 justify-content-center">
        {/* Menú de ordenamiento con ancho ajustado */}
        <Col md={8} className="d-flex justify-content-center">
          <Form.Select
            value={sortCriteria}
            onChange={handleSortChange} // Ajuste de ancho para igualar al de las cartas
            aria-label="Ordenar por"
          >
            <option value="title">Ordenar por Título</option>
            <option value="difficulty">Ordenar por Dificultad</option>
            <option value="type">Ordenar por Tipo</option>
            <option value="team">Ordenar por Team</option>
            <option value="estimatedTime">Ordenar por Tiempo Estimado</option>
          </Form.Select>
        </Col>
        {(userRole === 'admin' || userRole === 'profesor') && (
            <Col md={4} className="d-flex justify-content-center">
                <Button variant="primary" onClick={handleCreateCourse}>Crear Curso</Button>
            </Col>
        )}

      </Row>
      
      <Row>
        {/* Tarjetas en una columna */}
        <Col md={8} className="d-flex flex-wrap justify-content-center">
          {courses.map((course) => (
            <Card
              key={course.id}
              className={`m-2 ${isSelected(course) ? 'border-info shadow-lg' : ''}`} // Resaltar carta seleccionada
              style={{ width: '14rem', height: '18rem', cursor: 'pointer', transition: 'all 0.3s ease' }}
              onClick={() => setSelectedCourse(course)}
            >
              <Card.Header style={{ backgroundColor: getTeamColor(course.team) }}>
                <Card.Title className="h6">{course.title}</Card.Title>
              </Card.Header>
              <Card.Body className="d-flex flex-column justify-content-between">
                <p><strong>Tipo:</strong> {course.type}</p>
                <p><strong>Team:</strong> {course.team}</p>
                <p><strong>Dificultad:</strong> {renderDifficultyStars(course.difficulty)}</p>
                <p><strong>Tiempo Estimado:</strong> {course.estimated_time / 60} minutos</p>
              </Card.Body>
            </Card>
          ))}
        </Col>

        {/* Detalles del curso seleccionado */}
        <Col md={4}>
          {selectedCourse ? (
            <Card>
              <Card.Header style={{ backgroundColor: getTeamColor(selectedCourse.team) }}>
                <Card.Title className="h5">{selectedCourse.title}</Card.Title>
              </Card.Header>
              <Card.Body>
                <Card.Text><strong>Description:</strong> {selectedCourse.description}</Card.Text>
                <p><strong>Tipo:</strong> {selectedCourse.type}</p>
                <p><strong>Team:</strong> {selectedCourse.team}</p>
                <p><strong>Dificultad:</strong> {renderDifficultyStars(selectedCourse.difficulty)}</p>
                <p><strong>Tiempo Estimado:</strong> {selectedCourse.estimated_time / 60} minutos</p>
              </Card.Body>
            </Card>
          ) : (
            <Card className="text-center">
              <Card.Body>
                <Card.Text>
                  <em>Seleccione un curso para ver los detalles</em>
                </Card.Text>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Courses;
