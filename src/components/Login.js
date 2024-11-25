import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.get('https://34.134.65.19:5001/usuarios/api/usuarios');
      const users = response.data;

      const user = users.find(
        u => u.usuario_email === email && u.usuario_contrasena === password
      );

      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
        navigate('/');
      } else {
        setError('Correo electrónico o contraseña inválidos');
      }
    } catch (error) {
      setError('Error al conectar con el servidor. Por favor, intenta de nuevo.');
    }
  };

  return (
    <div className={styles['login-container']}>
      <div className={styles['login-box']}>
        <h1 className={styles['login-title']}>Iniciar sesión</h1>

        {error && <div className={styles['error-message']}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className={styles['login-form-group']}>
            <label htmlFor="email" className={styles['login-label']}>
              Correo electrónico
            </label>
            <input
              type="email"
              id="email"
              className={styles['login-input']}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles['login-form-group']}>
            <label htmlFor="password" className={styles['login-label']}>
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              className={styles['login-input']}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className={styles['forgot-password']}>
            <a href="/forgot-password">¿Olvidaste tu contraseña?</a>
          </div>

          <button type="submit" className={styles['sign-in-button']}>
            Iniciar sesión
          </button>
        </form>

        <div className={styles['footer']}>
          <img
            src="http://png.pngtree.com/png-clipart/20221027/ourmid/pngtree-music-logo-png-image_6389182.png"
            alt="Logo"
            className={styles['logo']}
          />
          <p>© 2024 Tienda Música. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
