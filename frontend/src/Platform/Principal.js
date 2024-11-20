import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {Card, Button, Container, Row, Col, Accordion } from "react-bootstrap";

const Principal = () => {
  const [recentCourses, setRecentCourses] = useState([]);
  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();
  const userId = localStorage.getItem("id");

  const itemsPerPage = 4;

  // Cargar datos desde el backend
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        console.log(localStorage.getItem("token"))
        // Petición para cursos recientes
        const recentResponse = await axios.get(`http://localhost:8000/user-courses/${userId}/courses`, {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json",
            }
        });
        setRecentCourses(recentResponse.data);

        // Petición para cursos recomendados
        const recommendedResponse = await axios.get(`http://localhost:8000/recommendations/${userId}`);
        setRecommendedCourses(recommendedResponse.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchDashboardData();
  }, [userId]);

  // Controlar el avance en el carrusel
  const handleNext = () => {
    if (currentIndex < recentCourses.length - itemsPerPage) {
      setCurrentIndex(currentIndex + 1);
    }
  };


  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
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

  return (
    <Container fluid>
      <Row>
        <Col>
          <h4>Últimos Cursos Realizados</h4>
          <div className="d-flex justify-content-center align-items-center">
            {recentCourses.length === 0? (
                <h5>No se han realizado cursos recientemente</h5>
            ):(
                <div className="d-flex align-items-center justify-content-center">
                    {/* Botón "Anterior" */}
                    <Button variant="secondary" onClick={handlePrev} disabled={currentIndex === 0}>
                        &lt;
                    </Button>

                    {/* Contenedor del carrusel */}
                    <div
                        className="carousel-items-wrapper d-flex overflow-hidden mx-3"
                        style={{
                            width:`${16.2*itemsPerPage}vw`
                        }}
                    >
                        <div
                            className="carousel-items d-flex"
                            style={{
                                transition: 'transform 0.5s ease', // Animación suave
                                transform: `translateX(-${currentIndex * 16.2}vw)`, // Desplazamiento del carrusel
                            }}
                        >
                            {/* Renderizar TODOS los elementos */}
                            {recentCourses.map((course, index) => (
                                <Card
                                    style={{
                                        width: '15vw',
                                        margin: '0.6vw',
                                        backgroundColor: getTeamColor(course.team),
                                    }}
                                    key={index}
                                >
                                    <Card.Body>
                                        <Card.Title>{course.title}</Card.Title>
                                        <Card.Text>
                                            <strong>Dificultad:</strong> {renderDifficultyStars(course.difficulty)}
                                            <br />
                                            <strong>Completado:</strong> {course.completed ? 'Sí' : 'No'}
                                            <br />
                                            <strong>Tiempo Invertido:</strong> {(course.time_spent / 60).toFixed(2)} minutos
                                        </Card.Text>
                                    </Card.Body>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Botón "Siguiente" */}
                    <Button
                        variant="secondary"
                        onClick={handleNext}
                        disabled={currentIndex >= recentCourses.length - itemsPerPage}
                    >
                        &gt;
                    </Button>
                </div>
            )}
          </div>
        </Col>
      </Row>

      <Row className="mt-4">
        {/* Cursos recomendados */}
        <Col md={9}>
            <h4>Cursos Recomendados</h4>
            {recommendedCourses.length === 0?(
                <h5>Por ahora no hay ninguna recomendación</h5>
            ):(
                <Accordion defaultActiveKey="0" className="mt-4 mx-4">
                    {recommendedCourses.map((course, index) => (
                    <Card key={index}>
                        <Accordion.Item eventKey={String(index)}>
                        <Accordion.Header>{course.title}</Accordion.Header>
                        <Accordion.Body>
                            <p style={{ marginBottom: '5px' }}>
                            <strong>Equipo: </strong>
                            <span 
                                style={{
                                display: 'inline-block',
                                width: '12px',
                                height: '12px',
                                borderRadius: '50%',
                                backgroundColor: getTeamColor(course.team),
                                marginRight: '10px',
                                verticalAlign: 'middle'
                                }}
                            ></span>
                            </p>
                            <p style={{ marginBottom: '5px' }}><strong>Tipo:</strong> {course.type}</p>
                            <p style={{ marginBottom: '5px' }}><strong>Dificultad:</strong> {renderDifficultyStars(course.difficulty)}</p>
                            <p style={{ marginBottom: '5px' }}><strong>Descripción:</strong> {course.description}</p> {/* Aquí puedes agregar la descripción del curso */}
                        </Accordion.Body>
                        </Accordion.Item>
                    </Card>
                    ))}
                </Accordion>
            )}
        </Col>

        <Col md={3}>
            <Row>
                <Card className="mt-5" style={{ width: '18rem' }}>
                    <Card.Body className="d-flex flex-column align-items-center justify-content-center">
                        <Card.Title className="text-center">¡Explora Nuevos Cursos!</Card.Title>
                        <Card.Text className="text-center">
                        Revisa que cursos posee la plataforma.
                        </Card.Text>
                        <Button 
                        variant="primary" 
                        onClick={() => navigate("/courses")}
                        >
                        Ver los cursos
                        </Button>
                    </Card.Body>
                </Card>
            </Row>
            <Row>
                <Card className="mt-5" style={{ width: '18rem' }}>
                    <Card.Body className="d-flex flex-column align-items-center justify-content-center">
                        <Card.Title className="text-center">¡Realiza Nuevos Retos!</Card.Title>
                        <Card.Text className="text-center">
                        Despliega nuevos retos que quieras realizar.
                        </Card.Text>
                        <Button 
                        variant="primary" 
                        onClick={() => navigate("/dashboard")}
                        >
                        Desplegar un reto
                        </Button>
                    </Card.Body>
                </Card>
            </Row>
        </Col>

      </Row>
    </Container>
  );
};

export default Principal;

