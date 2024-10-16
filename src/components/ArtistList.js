import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Table, Modal, Form, Dropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faToggleOn, faToggleOff, faPlus, faSearch, faFilter } from '@fortawesome/free-solid-svg-icons';
import ArtistForm from './ArtistForm'; // Importar el formulario para usarlo en el modal
import Swal from 'sweetalert2'; // Importar SweetAlert2

const ArtistList = () => {
  const [artistas, setArtistas] = useState([]);
  const [showModal, setShowModal] = useState(false); // Estado para el modal
  const [editingArtista, setEditingArtista] = useState(null); // Estado para editar artista
  const [searchTerm, setSearchTerm] = useState(''); // Estado para el buscador
  const [filterStatus, setFilterStatus] = useState('todos'); // Estado para el filtro de estado
  const [sortBy, setSortBy] = useState(''); // Estado para el ordenamiento
  const [currentPage, setCurrentPage] = useState(1); // Estado para la página actual
  const [itemsPerPage] = useState(10); // Número de elementos por página

  const formatDateTime = (datetime) => {
    const date = new Date(datetime);
    return date.toLocaleString();  // Formatear a cadena legible
  };

  useEffect(() => {
    fetchArtistas();
  }, []);

  const fetchArtistas = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/artistas/');
      setArtistas(response.data); // Asegurarnos de que obtenemos tanto los activos como los inactivos
    } catch (error) {
      console.error('Error al obtener los artistas:', error);
    }
  };

  const toggleArtista = async (artista) => {
    try {
      if (artista.artista_status === 'A') {
        await axios.put(`http://127.0.0.1:8000/artistas/${artista.artista_id}/desactivar`);
        Swal.fire({
          icon: 'success',
          title: 'Artista desactivado',
          text: 'El artista ha sido desactivado exitosamente.',
        });
      } else {
        await axios.put(`http://127.0.0.1:8000/artistas/${artista.artista_id}/activar`);
        Swal.fire({
          icon: 'success',
          title: 'Artista activado',
          text: 'El artista ha sido activado exitosamente.',
        });
      }
      fetchArtistas(); // Recargar la lista de artistas
    } catch (error) {
      console.error('Error al cambiar el estado del artista:', error);
      const errorMessage = error.response && error.response.data && error.response.data.detail
        ? error.response.data.detail
        : 'No se pudo cambiar el estado del artista.';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
      });
    }
  };

  const handleEdit = (artista) => {
    setEditingArtista(artista); // Establecer el artista en edición
    setShowModal(true); // Mostrar el modal para editar
  };

  const handleAddArtista = () => {
    setEditingArtista(null); // Limpiar el formulario para agregar
    setShowModal(true); // Mostrar el modal para agregar
  };

  const handleCloseModal = () => setShowModal(false); // Cerrar el modal

  // Filtrar artistas según el término de búsqueda y el estado
  const filteredArtistas = artistas.filter(artista =>
    artista.artista_nombre.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterStatus === 'todos' || artista.artista_status === filterStatus)
  );

  // Ordenar artistas
  const sortedArtistas = [...filteredArtistas].sort((a, b) => {
    if (sortBy === 'artistAsc') {
      return a.artista_nombre.localeCompare(b.artista_nombre);
    } else if (sortBy === 'artistDesc') {
      return b.artista_nombre.localeCompare(a.artista_nombre);
    }
    return 0;
  });

  // Paginación
  const indexOfLastArtista = currentPage * itemsPerPage;
  const indexOfFirstArtista = indexOfLastArtista - itemsPerPage;
  const currentArtistas = sortedArtistas.slice(indexOfFirstArtista, indexOfLastArtista);
  const totalPages = Math.ceil(sortedArtistas.length / itemsPerPage);

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center my-4">
        <h1>Lista de Artistas</h1>
        <Button variant="success" onClick={handleAddArtista}>
          <FontAwesomeIcon icon={faPlus} /> Agregar Artista
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
            placeholder="Buscar artista"
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
            <th>Estado</th>
            <th>Fecha Modificación</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {currentArtistas.map((artista) => (
            <tr key={artista.artista_id}>
              <td>{artista.artista_id}</td>
              <td>{artista.artista_nombre}</td>
              <td>{artista.artista_status === 'A' ? 'Activo' : 'Inactivo'}</td>
              <td>{formatDateTime(artista.artista_fecha_modificacion)}</td> {/* Mostrar fecha y hora de modificación */}
              <td>
                <Button variant="info" onClick={() => handleEdit(artista)}>
                  <FontAwesomeIcon icon={faEdit} /> Editar
                </Button>{' '}
                <Button
                  variant={artista.artista_status === 'A' ? 'danger' : 'success'}
                  onClick={() => toggleArtista(artista)}
                >
                  <FontAwesomeIcon icon={artista.artista_status === 'A' ? faToggleOff : faToggleOn} />
                  {' '}
                  {artista.artista_status === 'A' ? 'Desactivar' : 'Activar'}
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

      {/* Modal para agregar o editar artista */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{editingArtista ? 'Editar Artista' : 'Agregar Artista'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ArtistForm
            artista={editingArtista}
            onClose={handleCloseModal}
            refreshArtistas={fetchArtistas} // Refrescar la lista después de agregar/editar
          />
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ArtistList;
