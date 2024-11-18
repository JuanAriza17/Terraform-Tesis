import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { nanoid } from 'nanoid';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Card, Button, Row, Col, Modal } from 'react-bootstrap';

function ProtectedPage() {
    const [courses, setCourses] = useState([]);
    const [selectedCourses, setSelectedCourses] = useState([]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [modalCourse, setModalCourse] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        axios.get('http://localhost:8000/courses/all')
            .then(response => setCourses(response.data))
            .catch(error => console.error("Error loading courses:", error));
    }, []);

    const toggleCourseSelection = (course) => {
        setSelectedCourses((prevSelectedCourses) => {
            if (prevSelectedCourses.some((selected) => selected.id === course.id)) {
                return prevSelectedCourses.filter((selected) => selected.id !== course.id);
            } else {
                return [...prevSelectedCourses, course];
            }
        });
    };

    const handleDeploy = async () => {
        setLoading(true);
        const newFlags = selectedCourses.map(() => nanoid(16));
        const titles = selectedCourses.map((course) => (course.title+"_"+course.difficulty)); // Cambiar por alias
        console.log(titles);
        try {
            console.log(selectedCourses);
            const response = await axios.post('http://localhost:8000/deploy', {
                courses: titles,
                flags: newFlags,
            }, {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json",
                }
            });
            setMessage("Cursos desplegados");
            localStorage.setItem("workspace", response.data.workspace);
            navigate('/loading', { state: { courses: titles, flags: newFlags, ips: response.data.ip, ids: response.data.id } });
        } catch (error) {
            setMessage('Error al desplegar las máquinas');
            console.error(error.response);
        } finally {
            setLoading(false);
        }
    };

    const getTeamColor = (team) => {
        switch (team) {
            case 'RED':
                return '#f28b82';
            case 'BLUE':
                return '#aecbfa';
            case 'PURPLE':
                return '#cca9dd';
            default:
                return '#ffffff';
        }
    };

    const openDetails = (course) => {
        setModalCourse(course)
        setShowDetails(true);
    };

    const renderDifficultyStars = (difficulty) => {
        return '★'.repeat(difficulty) + '☆'.repeat(5 - difficulty);
    };
    
    const closeDetails = () => setShowDetails(false);

    return (
        <div className="container mt-5">
            <h1 className="text-center mb-4">Desplegar Curso de Ciberseguridad</h1>

            <Row>
                {courses.map((course) => (
                    <Col md={3} key={course.id} className="mb-3">
                        <Card
                            style={{
                                cursor: 'pointer',
                                backgroundColor: getTeamColor(course.team),
                                height: '150px', // Tamaño fijo para todas las cartas
                            }}
                            onClick={(e) => e.target.tagName !== 'BUTTON' && openDetails(course)}
                            className={`p-3 ${selectedCourses.some((selected) => selected.id === course.id) ? 'border-info shadow-lg' : ''}`}
                        >
                            <Card.Body className="d-flex flex-column justify-content-between">
                                <Card.Title>{course.title}</Card.Title>
                                <Button 
                                    style={{
                                        backgroundColor: selectedCourses.some((selected) => selected.id === course.id) ? '#bababa' : '#f5f5f5', // Cambia el color del fondo
                                        color: selectedCourses.some((selected) => selected.id === course.id) ? '#ffffff' : '#000000', // Cambia el color del texto
                                        borderColor: selectedCourses.some((selected) => selected.id === course.id) ? '#bababa' : '#f5f5f5' // Cambia el color del borde
                                    }}
                                    className='btn'
                                    variant={selectedCourses.some((selected) => selected.id === course.id) ? 'danger' : 'primary'}
                                    onClick={() => toggleCourseSelection(course)}
                                >
                                    {selectedCourses.some((selected) => selected.id === course.id) ? 'Deseleccionar' : 'Seleccionar'}
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            <div className="mt-4">
                <h3>Seleccionados:</h3>
                {selectedCourses.length === 0 ? (
                    <p>No has seleccionado ningún curso.</p>
                ) : (
                    <ul>
                        {selectedCourses.map((course) => (
                            <li key={course.id}>{course.title}</li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="d-flex justify-content-center mt-4">
                <Button
                    variant="primary"
                    onClick={handleDeploy}
                    disabled={selectedCourses.length === 0 || loading}
                >
                    {loading ? 'Desplegando...' : 'Desplegar Cursos'}
                </Button>
            </div>

            <h2 className="mt-4">{message}</h2>

            {/* Modal para mostrar detalles del curso */}
            <Modal show={showDetails} onHide={closeDetails}>
                <Modal.Header closeButton>
                    <Modal.Title>{modalCourse?.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>{modalCourse?.description}</p>
                    <p><strong>Equipo:</strong> {modalCourse?.team}</p>
                    <p><strong>Dificultad:</strong> {renderDifficultyStars(modalCourse?.difficulty)}</p>
                    <p><strong>Tiempo estimado:</strong> {modalCourse?.estimated_time / 60} minutos</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeDetails}>Cerrar</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default ProtectedPage;
