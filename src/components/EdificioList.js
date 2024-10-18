import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Table, Modal, Form, Dropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faPlus, faSearch, faFilter } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import EdificioForm from './EdificioForm';

const EdificioList = () => {
  const [edificios, setEdificios] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingEdificio, setEditingEdificio] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [sortBy, setSortBy] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchEdificios();
  }, []);

  const fetchEdificios = async () => {
    try {
      const response = await axios.get('https://20.246.139.92/api/edificios/');
      setEdificios(response.data);
    } catch (error) {
      console.error('Error al obtener los edificios:', error);
    }
  };

  const handleEdit = (edificio) => {
    setEditingEdificio(edificio);
    setShowModal(true);
  };

  const handleShowModal = () => {
    setEditingEdificio(null);
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleDelete = async (edificio_id) => {
    try {
      // Comprobar si el edificio está asociado a alguna ubicación
      const ubicacionesResponse = await axios.get('https://20.246.139.92/api/ubicaciones/');
      const ubicaciones = ubicacionesResponse.data;
      const isEdificioInUbicaciones = ubicaciones.some(ubicacion => ubicacion.edificio_id === edificio_id);
      
      if (isEdificioInUbicaciones) {
        Swal.fire({
          icon: 'warning',
          title: 'Advertencia',
          text: 'No se puede eliminar el edificio porque está asociado a una ubicación.',
        });
        return;
      }

      await axios.delete(`https://20.246.139.92/api/edificios/${edificio_id}`);
      Swal.fire({
        icon: 'success',
        title: 'Edificio eliminado',
        text: 'El edificio ha sido eliminado exitosamente.',
      });
      fetchEdificios();
    } catch (error) {
      console.error('Error al eliminar el edificio:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar el edificio.',
      });
    }
  };

  const filteredEdificios = edificios.filter((edificio) => {
    const nameMatch = edificio.edificio_nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = filterStatus === 'todos' || edificio.edificio_status === filterStatus;
    return nameMatch && statusMatch;
  });

  const sortedEdificios = [...filteredEdificios].sort((a, b) => {
    if (sortBy === 'nombreAsc') {
      return a.edificio_nombre.localeCompare(b.edificio_nombre);
    } else if (sortBy === 'nombreDesc') {
      return b.edificio_nombre.localeCompare(a.edificio_nombre);
    }
    return 0;
  });

  const indexOfLastEdificio = currentPage * itemsPerPage;
  const indexOfFirstEdificio = indexOfLastEdificio - itemsPerPage;
  const currentEdificios = sortedEdificios.slice(indexOfFirstEdificio, indexOfLastEdificio);
  const totalPages = Math.ceil(sortedEdificios.length / itemsPerPage);

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center my-4">
        <h1>Lista de Edificios</h1>
        <Button variant="success" onClick={handleShowModal}>
          <FontAwesomeIcon icon={faPlus} /> Agregar Edificio
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
            <Dropdown.Item onClick={() => setSortBy('nombreAsc')}>Edificio A-Z</Dropdown.Item>
            <Dropdown.Item onClick={() => setSortBy('nombreDesc')}>Edificio Z-A</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Dirección</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {currentEdificios.map((edificio) => (
            <tr key={edificio.edificio_id}>
              <td>{edificio.edificio_id}</td>
              <td>{edificio.edificio_nombre}</td>
              <td>{edificio.edificio_direccion}</td>
              <td>{edificio.edificio_status === 'A' ? 'Activo' : 'Inactivo'}</td>
              <td>
                <Button variant="info" onClick={() => handleEdit(edificio)}>
                  <FontAwesomeIcon icon={faEdit} /> Editar
                </Button>{' '}
                <Button
                  variant="danger"
                  onClick={() => handleDelete(edificio.edificio_id)}
                >
                  Eliminar
                </Button>
              </td>
            </tr>
          ))}
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
          <Modal.Title>{editingEdificio ? 'Editar Edificio' : 'Agregar Edificio'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <EdificioForm edificio={editingEdificio} onClose={handleCloseModal} refreshEdificios={fetchEdificios} />
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default EdificioList;


