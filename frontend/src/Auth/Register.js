import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const validateForm = () => {
        if (!username || !password || !confirmPassword) {
            setError('All fields are required');
            return false;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return false;
        }
        setError('');
        return true;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!validateForm()) return;
        setLoading(true);

        const formDetails = { username, password };

        try {
            const response = await axios.post('http://localhost:8000/auth/', formDetails, {
                headers: { "Content-Type": "application/json" },
            });
            setLoading(false);
            const responseOK = response && response.status === 201;
            if (responseOK) {
                const formData = new URLSearchParams();
                formData.append('username', username);
                formData.append('password', password);
                
                const loginResponse = await axios.post('http://localhost:8000/auth/token', formData, {
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                });

                const responseLoginOK = loginResponse && loginResponse.status === 200 && loginResponse.statusText === 'OK';

                if (responseLoginOK) {
                    localStorage.setItem('token', loginResponse.data.access_token);
                    localStorage.setItem("id", response.data.id);
                    setLoading(false);
                    navigate('/principal'); // Redirigir a la página protegida
                } else {
                    setError('Login after registration failed!');
                }
            }
        } catch (error) {
            setLoading(false);
            if (error.response && error.response.status === 400 && error.response.data.detail === "Username already registered") {
                setError('Username already exists, please choose another one.');
            } else {
                setError('An error occurred. Please try again.');
            }
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-4">
                    <h2 className="text-center mb-4">Registrarse</h2>
                    <form onSubmit={handleSubmit} className="card p-4">
                        <div className="form-group mb-3">
                            <label htmlFor="username">Usuario</label>
                            <input 
                                type='text'
                                className="form-control"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div className="form-group mb-3">
                            <label htmlFor="password">Contraseña</label>
                            <input 
                                type='password'
                                className="form-control"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div className="form-group mb-3">
                            <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                            <input 
                                type='password'
                                className="form-control"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                        <button type='submit' className="btn btn-primary w-100" disabled={loading}>
                            {loading ? "Registering..." : "Register"}
                        </button>
                        {error && <p className="text-danger mt-3">{error}</p>}
                    </form>
                    <div className="row justify-content-center text-center">
                        <p className="mt-3">¿Ya tienes una cuenta? <Link to="/login">Inicia Sesión</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;
