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
        <div>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Username:</label>
                    <input 
                        type='text'
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <div>
                    <label>Password:</label>
                    <input 
                        type='password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <button type='submit' disabled={loading}>
                    {loading ? "Logging in...":"Login"}
                </button>
                {error && <p style={{color: "red"}}>{error}</p>}
            </form>
        </div>
    );
 }

 export default Login;