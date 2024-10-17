import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';

 function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const validateForm = () => {
        if (!username || !password) {
            setError("Username and password are required");
            return false;
        }
        setError('');
        return true
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!validateForm()) return;
        setLoading(true);

        const formDetails = new URLSearchParams();
        formDetails.append('username', username);
        formDetails.append('password', password);

        try{
            const response = await axios.post('http://localhost:8000/auth/token', formDetails, {headers: {"Content-Type": "application/x-www-form-urlencoded"}});
            setLoading(false);
            const responseOK = response && response.status === 200 && response.statusText === 'OK';
            if (responseOK) {
                localStorage.setItem('token', response.data.access_token);
                navigate('/protected');
            } else {
                setError("Authentication failed!");
            }
                
        } catch (error) {
            setLoading(false);
            console.log(error);
            setError('An error occured. Please try again later.');
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-4">
                    <h2 className="text-center mb-4">Login</h2>
                    <form onSubmit={handleSubmit} className="card p-4">
                        <div className="form-group mb-3">
                            <label htmlFor="username">Username</label>
                            <input 
                                type='text'
                                className="form-control"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div className="form-group mb-3">
                            <label htmlFor="password">Password</label>
                            <input 
                                type='password'
                                className="form-control"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <button type='submit' className="btn btn-primary w-100" disabled={loading}>
                            {loading ? "Logging in..." : "Login"}
                        </button>
                        {error && <p className="text-danger mt-3">{error}</p>}
                    </form>
                </div>
            </div>
        </div>
    );
 }

 export default Login;