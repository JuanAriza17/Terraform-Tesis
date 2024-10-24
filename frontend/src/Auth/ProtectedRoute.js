import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function ProtectedRoute({ children }) {
    const navigate = useNavigate();

    useEffect(() => {
        const verifyToken = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const response = await axios.get(`http://localhost:8000/auth/verify-token/${token}`);
                if (response.status !== 200) {
                    throw new Error('Token verification failed');
                }
            } catch (error) {
                localStorage.removeItem("token");
                navigate("/login");
            }
        };

        verifyToken();
    }, [navigate]);

    return children;
}

export default ProtectedRoute;
