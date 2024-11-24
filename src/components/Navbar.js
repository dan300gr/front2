import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Button, Container } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

const MyNavbar = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigate = useNavigate();

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <Navbar
      bg={isDarkMode ? 'dark' : 'light'}
      variant={isDarkMode ? 'dark' : 'light'}
      expand="lg"
      className="shadow-sm"
      style={{ fontWeight: 500 }}
    >
      <Container>
        <Navbar.Brand
          as={Link}
          to="/"
          style={{ display: 'flex', alignItems: 'center' }}
        >
          <img
            src="http://png.pngtree.com/png-clipart/20221027/ourmid/pngtree-music-logo-png-image_6389182.png"
            alt="Logo"
            style={{ width: '30px', height: '30px', marginRight: '10px' }}
          />
          Tienda Música
        </Navbar.Brand>
<Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto">
            <Nav.Link as={Link} to="/productos">Productos</Nav.Link>
            <Nav.Link as={Link} to="/catalogos">Catálogos</Nav.Link>
            <Nav.Link as={Link} to="/albums">Álbumes</Nav.Link>
            <Nav.Link as={Link} to="/artistas">Artistas</Nav.Link>
            <Nav.Link as={Link} to="/tipoproductos">Tipo Producto</Nav.Link>
            <Nav.Link as={Link} to="/proveedores">Proveedores</Nav.Link>
            <Nav.Link as={Link} to="/edificios">Edificios</Nav.Link>
            <Nav.Link as={Link} to="/ubicaciones">Ubicaciones</Nav.Link>
            <Nav.Link as={Link} to="/inventarios">Inventarios</Nav.Link>
            <Nav.Link as={Link} to="/stocks">Stocks</Nav.Link>
          </Nav>
          <Button
            variant={isDarkMode ? 'light' : 'dark'}
            onClick={toggleTheme}
            style={{ marginLeft: '10px', marginRight: '10px' }}
          >
            <FontAwesomeIcon
              icon={isDarkMode ? faSun : faMoon}
              style={{ margin: '0 5px' }}
            />
          </Button>
          <Button
            variant="outline-danger"
            onClick={handleLogout}
            style={{ marginLeft: '10px' }}
          >
            <FontAwesomeIcon icon={faSignOutAlt} style={{ marginRight: '5px' }} />
            Cerrar sesión
          </Button>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default MyNavbar;

