
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function Login({ onClose }) {
  const { isLoggedIn, login, logout, loginModalOpen, openLoginModal, closeLoginModal } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLoginClick = () => openLoginModal();

  const handleClose = () => {
    closeLoginModal();
    if (onClose) onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error);
      }

      // Backend now returns { message, token, user }. login() closes the modal.
      login(result.token, result.user);
      navigate('/');
    } catch (err) {
      setError('Incorrect email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutClick = async () => {
    await logout();
    handleClose();
  };

  return (
    <>
      {isLoggedIn ? (
        <button type="button" onClick={handleLogoutClick}>
          Logout
        </button>
      ) : (
        <button onClick={handleLoginClick}>Login</button>
      )}
      {loginModalOpen &&
        createPortal(
          <div className="login-overlay">
            <div className="login-box">
              {loginModalOpen && (
                <button
                  onClick={() => {
                    navigate('/signup');
                    handleClose();
                  }}
                >
                  Sign Up
                </button>
              )}

              <h2>Login</h2>
              <form onSubmit={handleSubmit}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  autoComplete="username"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  autoComplete="current-password"
                />
                {error && <p className="login-error">{error}</p>}
                <button type="button" onClick={handleClose}>Close</button>
                <button type="submit" disabled={loading}>
                  {loading ? 'Signing in...' : 'Submit'}
                </button>
              </form>
            </div>
          </div>,
          document.getElementById('modal-root')
        )}
    </>
  );
}

export default Login;