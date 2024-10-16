import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Table, Modal, Form, Dropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faToggleOn, faToggleOff, faPlus, faSearch, faFilter } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2'; // Importar SweetAlert2
import AlbumForm from './AlbumForm'; // Importamos el formulario para usarlo en el modal

const AlbumList = () => {
  const [albums, setAlbums] = useState([]);
  const [showModal, setShowModal] = useState(false); // Estado para el modal
  const [editingAlbum, setEditingAlbum] = useState(null); // Estado para editar álbum
  const [searchTerm, setSearchTerm] = useState(''); // Estado para el buscador
  const [sortBy, setSortBy] = useState(''); // Estado para el ordenamiento
  const [filterStatus, setFilterStatus] = useState('todos'); // Estado para el filtro de estado
  const [artistas, setArtistas] = useState([]); // Estado para artistas
  const [currentPage, setCurrentPage] = useState(1); // Estado para la página actual
  const [itemsPerPage] = useState(10); // Número de elementos por página

  useEffect(() => {
    fetchAlbums();
    fetchArtistas(); // Cargar artistas al iniciar
  }, []);

  const fetchAlbums = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/albums/');
      setAlbums(response.data); // Asegurarnos de que obtenemos tanto los activos como los inactivos
    } catch (error) {
      console.error('Error al obtener los álbumes:', error);
    }
  };

  const fetchArtistas = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/artistas/');
      setArtistas(response.data); // Cargar la lista de artistas
    } catch (error) {
      console.error('Error al obtener los artistas:', error);
    }
  };

  const formatDateTime = (datetime) => {
    const date = new Date(datetime);
    return date.toLocaleString();  // Formatear a cadena legible
  };

  const toggleAlbum = async (album) => {
    try {
      if (album.album_status === 'A') {
        await axios.put(`http://127.0.0.1:8000/albums/${album.album_id}/desactivar`);
        Swal.fire({
          icon: 'success',
          title: 'Álbum desactivado',
          text: 'El álbum ha sido desactivado exitosamente.',
        });
      } else {
        await axios.put(`http://127.0.0.1:8000/albums/${album.album_id}/activar`);
        Swal.fire({
          icon: 'success',
          title: 'Álbum activado',
          text: 'El álbum ha sido activado exitosamente.',
        });
      }
      fetchAlbums(); // Recargar la lista de álbumes
    } catch (error) {
      console.error('Error al cambiar el estado del álbum:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cambiar el estado del álbum.',
      });
    }
  };

  const handleEdit = (album) => {
    setEditingAlbum(album); // Establecer el álbum en edición
    setShowModal(true); // Mostrar el modal para editar
  };

  const handleAddAlbum = () => {
    setEditingAlbum(null); // Limpiar el formulario para agregar
    setShowModal(true); // Mostrar el modal para agregar
  };

  const handleCloseModal = () => setShowModal(false); // Cerrar el modal

  // Función para obtener el nombre del artista
  const getArtistaNombre = (artista_id) => {
    const artista = artistas.find(artista => artista.artista_id === artista_id);
    return artista ? artista.artista_nombre : 'Sin artista'; // Devuelve el nombre del artista o 'Sin artista'
  };

  // Filtrar álbumes según el término de búsqueda y el estado
  const filteredAlbums = albums.filter(album =>
    album.album_nombre.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterStatus === 'todos' || album.album_status === filterStatus)
  );

  // Ordenar álbumes
  const sortedAlbums = [...filteredAlbums].sort((a, b) => {
    if (sortBy === 'albumAsc') {
      return a.album_nombre.localeCompare(b.album_nombre);
    } else if (sortBy === 'albumDesc') {
      return b.album_nombre.localeCompare(a.album_nombre);
    } else if (sortBy === 'artistAsc') {
      return getArtistaNombre(a.artista_id).localeCompare(getArtistaNombre(b.artista_id)) || 0;
    } else if (sortBy === 'artistDesc') {
      return getArtistaNombre(b.artista_id).localeCompare(getArtistaNombre(a.artista_id)) || 0;
    }
    return 0;
  });

  // Paginación
  const indexOfLastAlbum = currentPage * itemsPerPage;
  const indexOfFirstAlbum = indexOfLastAlbum - itemsPerPage;
  const currentAlbums = sortedAlbums.slice(indexOfFirstAlbum, indexOfLastAlbum);

  const totalPages = Math.ceil(sortedAlbums.length / itemsPerPage);

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center my-4">
        <h1>Lista de Álbumes</h1>
        <Button variant="success" onClick={handleAddAlbum}>
          <FontAwesomeIcon icon={faPlus} /> Agregar Álbum
        </Button>
      </div>

      <div className="d-flex mb-3 justify-content-between">
        {/* Filtro por estado (Checklist debajo del buscador) */}
        <Form.Check
          type="radio"
          label="Mostrar todos"
          name="statusFilter"
          value="todos"
          onChange={(e) => setFilterStatus(e.target.value)}
          checked={filterStatus === 'todos'}
        />
        <Form.Check
          type="radio"
          label="Activos"
          name="statusFilter"
          value="A"
          onChange={(e) => setFilterStatus(e.target.value)}
          checked={filterStatus === 'A'}
        />
        <Form.Check
          type="radio"
          label="Inactivos"
          name="statusFilter"
          value="I"
          onChange={(e) => setFilterStatus(e.target.value)}
          checked={filterStatus === 'I'}
        />

        {/* Buscador a la derecha */}
        <div style={{ position: 'relative', width: '200px' }}>
          <Form.Control
            type="text"
            placeholder="Buscar álbum"
            style={{ height: '38px' }} // Ajustar el tamaño del buscador
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button variant="outline-success" onClick={() => setSearchTerm('')} style={{ position: 'absolute', right: 0, top: 0 }}>
            <FontAwesomeIcon icon={faSearch} />
          </Button>
        </div>
      </div>

      <div className="d-flex mb-3 justify-content-start">
        {/* Ordenar con icono de filtro */}
        <Dropdown>
          <Dropdown.Toggle variant="outline-secondary" id="dropdown-basic" className="d-flex align-items-center">
            <FontAwesomeIcon icon={faFilter} style={{ marginRight: '5px' }} />
            Ordenar
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <Dropdown.Item onClick={() => setSortBy('albumAsc')}>Álbum A-Z</Dropdown.Item>
            <Dropdown.Item onClick={() => setSortBy('albumDesc')}>Álbum Z-A</Dropdown.Item>
            <Dropdown.Item onClick={() => setSortBy('artistAsc')}>Artista A-Z</Dropdown.Item>
            <Dropdown.Item onClick={() => setSortBy('artistDesc')}>Artista Z-A</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Artista</th>
            <th>Estado</th>
            <th>Fecha Modificación</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {currentAlbums.map((album) => (
            <tr key={album.album_id}>
              <td>{album.album_id}</td>
              <td>{album.album_nombre}</td>
              <td>{getArtistaNombre(album.artista_id)}</td> {/* Mostrar el nombre del artista */}
              <td>{album.album_status === 'A' ? 'Activo' : 'Inactivo'}</td>
              <td>{formatDateTime(album.album_fecha_modificacion)}</td> {/* Mostrar fecha y hora de modificación */}
              <td>
                <Button variant="info" onClick={() => handleEdit(album)}>
                  <FontAwesomeIcon icon={faEdit} /> Editar
                </Button>{' '}
                <Button
                  variant={album.album_status === 'A' ? 'danger' : 'success'}
                  onClick={() => toggleAlbum(album)}
                >
                  <FontAwesomeIcon icon={album.album_status === 'A' ? faToggleOff : faToggleOn} />
                  {' '}
                  {album.album_status === 'A' ? 'Desactivar' : 'Activar'}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Paginación */}
      <nav style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
        <ul className="pagination">
          <li className="page-item">
            <Button
              className="page-link"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              &laquo; {/* Flecha izquierda */}
            </Button>
          </li>
          {/* Mostrar solo 3 números de página */}
          {Array.from({ length: Math.min(3, totalPages) }).map((_, index) => {
            const pageNumber = index + Math.max(currentPage - 1, 1);
            if (pageNumber <= totalPages) {
              return (
                <li key={pageNumber} className="page-item">
                  <Button
                    onClick={() => setCurrentPage(pageNumber)}
                    className="page-link"
                  >
                    {pageNumber}
                  </Button>
                </li>
              );
            }
            return null;
          })}
          <li className="page-item">
            <Button
              className="page-link"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              &raquo; {/* Flecha derecha */}
            </Button>
          </li>
        </ul>
      </nav>

      {/* Modal para agregar o editar álbum */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{editingAlbum ? 'Editar Álbum' : 'Agregar Álbum'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <AlbumForm
            album={editingAlbum}
            onClose={handleCloseModal}
            refreshAlbums={fetchAlbums} // Refrescar la lista después de agregar/editar
          />
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default AlbumList;
