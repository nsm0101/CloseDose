import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { requireAuth } from '../../authService';
import '../../styles.css';

const Scan = () => {
    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const tokenFromUrl = new URLSearchParams(location.search).get('token');
        if (!tokenFromUrl) {
            setError('Missing token. This link should look like /cappy/scan/?token=...');
            setIsLoading(false);
            return;
        }
        setToken(tokenFromUrl);

        const checkAuth = async () => {
            try {
                const authUser = await requireAuth({ nextUrl: location.pathname + location.search });
                if (authUser) {
                    setUser(authUser);
                }
            } catch (err) {
                // Errors are handled within requireAuth (e.g., navigation)
            }
            setIsLoading(false);
        };

        checkAuth();
    }, [location, navigate]);

    if (isLoading) {
        return (
            <div className="card">
                <h2>Scanning...</h2>
                <p><span className="badge">token</span> <code>{token ?? '—'}</code></p>
                <p><small>If you are not signed in, you will be redirected to login and brought back here.</small></p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="card">
                <h2>Error</h2>
                <p>{error}</p>
            </div>
        );
    }

    if (!user) {
        // requireAuth handles redirection, so this is a fallback.
        return (
            <div className="card">
                <h2>Redirecting to login...</h2>
            </div>
        );
    }

    return (
        <div className="card">
            <h2>Scan unlocked</h2>
            <p><span className="badge">signed in</span> {user.email ?? '(no email)'}</p>
            <p><span className="badge">token</span> <code>{token}</code></p>
            <hr />
            <p>✅ Auth is working.</p>
            <p>Next: call <code>firebase.functions().httpsCallable("resolve_scan_token")</code> and render the medication dosing card.</p>
        </div>
    );
};

export default Scan;
