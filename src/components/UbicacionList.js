import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Table, Modal, Form, Dropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faPlus, faSearch, faFilter } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import UbicacionForm from './UbicacionForm';

const UbicacionList = () => {
  const [ubicaciones, setUbicaciones] = useState([]);
  const [edificios, setEdificios] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUbicacion, setEditingUbicacion] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [sortBy, setSortBy] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchUbicaciones();
    fetchEdificios(); // Obtener edificios al cargar el componente
  }, []);

  const fetchUbicaciones = async () => {
    try {
      const response = await axios.get('https://20.246.139.92/api/ubicaciones/');
      setUbicaciones(response.data);
    } catch (error) {
      console.error('Error al obtener las ubicaciones:', error);
    }
  };

  const fetchEdificios = async () => {
    try {
      const response = await axios.get('https://20.246.139.92/api/edificios/'); // Cambia la URL según corresponda
      setEdificios(response.data.filter(edificio => edificio.edificio_status === 'A')); // Filtrar edificios activos
    } catch (error) {
      console.error('Error al obtener edificios:', error);
    }
  };

  const handleEdit = (ubicacion) => {
    setEditingUbicacion(ubicacion);
    setShowModal(true);
  };

  const handleShowModal = () => {
    setEditingUbicacion(null);
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleDelete = async (ubicacion_id) => {
    try {
      // Comprobar si la ubicación está asociada a algún inventario
      const inventarioResponse = await axios.get('https://20.246.139.92/api/inventarios/');
      const inventarios = inventarioResponse.data;
      const isUbicacionInInventario = inventarios.some(inventario => inventario.ubicacion_id === ubicacion_id);
      
      if (isUbicacionInInventario) {
        Swal.fire({
          icon: 'warning',
          title: 'Advertencia',
          text: 'No se puede eliminar la ubicación porque está asociada a un inventario.',
        });
        return;
      }

      await axios.delete(`https://20.246.139.92/api/ubicaciones/${ubicacion_id}`);
      Swal.fire({
        icon: 'success',
        title: 'Ubicación eliminada',
        text: 'La ubicación ha sido eliminada exitosamente.',
      });
      fetchUbicaciones();
    } catch (error) {
      console.error('Error al eliminar la ubicación:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar la ubicación.',
      });
    }
  };

  const filteredUbicaciones = ubicaciones.filter((ubicacion) => {
    const nameMatch = ubicacion.ubicacion_nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = filterStatus === 'todos' || ubicacion.ubicacion_status === filterStatus;
    return nameMatch && statusMatch;
  });

  const sortedUbicaciones = [...filteredUbicaciones].sort((a, b) => {
    if (sortBy === 'nombreAsc') {
      return a.ubicacion_nombre.localeCompare(b.ubicacion_nombre);
    } else if (sortBy === 'nombreDesc') {
      return b.ubicacion_nombre.localeCompare(a.ubicacion_nombre);
    }
    return 0;
  });

  const indexOfLastUbicacion = currentPage * itemsPerPage;
  const indexOfFirstUbicacion = indexOfLastUbicacion - itemsPerPage;
  const currentUbicaciones = sortedUbicaciones.slice(indexOfFirstUbicacion, indexOfLastUbicacion);
  const totalPages = Math.ceil(sortedUbicaciones.length / itemsPerPage);

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center my-4">
        <h1>Lista de Ubicaciones</h1>
        <Button variant="success" onClick={handleShowModal}>
          <FontAwesomeIcon icon={faPlus} /> Agregar Ubicación
        </Button>
      </div>

      <div className="d-flex mb-3 justify-content-between">
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

        <div style={{ position: 'relative', width: '200px' }}>
          <Form.Control
            type="text"
            placeholder="Buscar"
            style={{ height: '38px' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button variant="outline-success" onClick={() => setSearchTerm('')} style={{ position: 'absolute', right: 0, top: 0 }}>
            <FontAwesomeIcon icon={faSearch} />
          </Button>
        </div>
      </div>

      <div className="d-flex mb-3 justify-content-start">
        <Dropdown>
          <Dropdown.Toggle variant="outline-secondary" id="dropdown-basic" className="d-flex align-items-center">
            <FontAwesomeIcon icon={faFilter} style={{ marginRight: '5px' }} />
            Ordenar
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <Dropdown.Item onClick={() => setSortBy('nombreAsc')}>Ubicación A-Z</Dropdown.Item>
            <Dropdown.Item onClick={() => setSortBy('nombreDesc')}>Ubicación Z-A</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Edificio</th> {/* Nueva columna para el nombre del edificio */}
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {currentUbicaciones.map((ubicacion) => {
            const edificio = edificios.find(edificio => edificio.edificio_id === ubicacion.edificio_id);
            return (
              <tr key={ubicacion.ubicacion_id}>
                <td>{ubicacion.ubicacion_id}</td>
                <td>{ubicacion.ubicacion_nombre}</td>
                <td>{edificio ? edificio.edificio_nombre : 'N/A'}</td> {/* Mostrar nombre del edificio */}
                <td>{ubicacion.ubicacion_status === 'A' ? 'Activo' : 'Inactivo'}</td>
                <td>
                  <Button variant="info" onClick={() => handleEdit(ubicacion)}>
                    <FontAwesomeIcon icon={faEdit} /> Editar
                  </Button>{' '}
                  <Button
                    variant="danger"
                    onClick={() => handleDelete(ubicacion.ubicacion_id)}
                  >
                    Eliminar
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>

      <nav style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
        <ul className="pagination">
          <li className="page-item">
            <Button
              className="page-link"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              &laquo;
            </Button>
          </li>
          {Array.from({ length: Math.min(3, totalPages) }).map((_, index) => {
            const pageNumber = index + Math.max(currentPage - 1, 1);
            if (pageNumber <= totalPages) {
              return (
                <li key={pageNumber} className="page-item">
                  <Button onClick={() => setCurrentPage(pageNumber)} className="page-link">
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
              &raquo;
            </Button>
          </li>
        </ul>
      </nav>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{editingUbicacion ? 'Editar Ubicación' : 'Agregar Ubicación'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <UbicacionForm ubicacion={editingUbicacion} onClose={handleCloseModal} refreshUbicaciones={fetchUbicaciones} />
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default UbicacionList;
