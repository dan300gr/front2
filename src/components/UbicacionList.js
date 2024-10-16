import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Table, Modal, Form, Dropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faToggleOn, faToggleOff, faPlus, faSearch, faFilter } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import UbicacionForm from './UbicacionForm'; // Importar el formulario para usarlo en el modal

const UbicacionList = () => {
  const [ubicaciones, setUbicaciones] = useState([]);
  const [edificios, setEdificios] = useState([]); // Estado para edificios
  const [showModal, setShowModal] = useState(false);
  const [editingUbicacion, setEditingUbicacion] = useState(null); 
  const [searchTerm, setSearchTerm] = useState(''); 
  const [sortBy, setSortBy] = useState(''); 
  const [filterStatus, setFilterStatus] = useState('todos');
  const [currentPage, setCurrentPage] = useState(1); 
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchUbicaciones();
    fetchEdificios();
  }, []);

  const fetchUbicaciones = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/ubicaciones/');
      setUbicaciones(response.data);
    } catch (error) {
      console.error('Error al obtener las ubicaciones:', error);
    }
  };

  const fetchEdificios = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/edificios/');
      setEdificios(response.data); // Obtener edificios
    } catch (error) {
      console.error('Error al obtener los edificios:', error);
    }
  };

  const formatDateTime = (datetime) => {
    const date = new Date(datetime);
    return date.toLocaleString();  
  };

  const toggleUbicacion = async (ubicacion) => {
    try {
      if (ubicacion.ubicacion_status === 'A') {
        await axios.put(`http://127.0.0.1:8000/ubicaciones/${ubicacion.ubicacion_id}/desactivar`);
        Swal.fire({
          icon: 'success',
          title: 'Ubicación desactivada',
          text: 'La ubicación ha sido desactivada exitosamente.',
        });
      } else {
        await axios.put(`http://127.0.0.1:8000/ubicaciones/${ubicacion.ubicacion_id}/activar`);
        Swal.fire({
          icon: 'success',
          title: 'Ubicación activada',
          text: 'La ubicación ha sido activada exitosamente.',
        });
      }
      fetchUbicaciones(); 
    } catch (error) {
      console.error('Error al cambiar el estado de la ubicación:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cambiar el estado de la ubicación.',
      });
    }
  };

  const handleEdit = (ubicacion) => {
    setEditingUbicacion(ubicacion);
    setShowModal(true);
  };

  const handleAddUbicacion = () => {
    setEditingUbicacion(null); 
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  // Función para obtener el nombre del edificio
  const getEdificioNombre = (edificio_id) => {
    const edificio = edificios.find(ed => ed.edificio_id === edificio_id);
    return edificio ? edificio.edificio_nombre : 'Sin edificio'; 
  };

  const filteredUbicaciones = ubicaciones.filter(ubicacion =>
    ubicacion.ubicacion_nombre.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterStatus === 'todos' || ubicacion.ubicacion_status === filterStatus)
  );

  const sortedUbicaciones = [...filteredUbicaciones].sort((a, b) => {
    if (sortBy === 'nombreAsc') {
      return a.ubicacion_nombre.localeCompare(b.ubicacion_nombre);
    } else if (sortBy === 'nombreDesc') {
      return b.ubicacion_nombre.localeCompare(a.ubicacion_nombre);
    } else if (sortBy === 'edificioAsc') {
      return getEdificioNombre(a.edificio_id).localeCompare(getEdificioNombre(b.edificio_id));
    } else if (sortBy === 'edificioDesc') {
      return getEdificioNombre(b.edificio_id).localeCompare(getEdificioNombre(a.edificio_id));
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
        <Button variant="success" onClick={handleAddUbicacion}>
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
            placeholder="Buscar ubicación"
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
            <Dropdown.Item onClick={() => setSortBy('nombreAsc')}>Nombre A-Z</Dropdown.Item>
            <Dropdown.Item onClick={() => setSortBy('nombreDesc')}>Nombre Z-A</Dropdown.Item>
            <Dropdown.Item onClick={() => setSortBy('edificioAsc')}>Edificio A-Z</Dropdown.Item>
            <Dropdown.Item onClick={() => setSortBy('edificioDesc')}>Edificio Z-A</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Edificio</th>
            <th>Estado</th>
            <th>Fecha Modificación</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {currentUbicaciones.map((ubicacion) => (
            <tr key={ubicacion.ubicacion_id}>
              <td>{ubicacion.ubicacion_id}</td>
              <td>{ubicacion.ubicacion_nombre}</td>
              <td>{getEdificioNombre(ubicacion.edificio_id)}</td>
              <td>{ubicacion.ubicacion_status === 'A' ? 'Activo' : 'Inactivo'}</td>
              <td>{formatDateTime(ubicacion.ubicacion_fecha_modificacion)}</td>
              <td>
                <Button variant="info" onClick={() => handleEdit(ubicacion)}>
                  <FontAwesomeIcon icon={faEdit} /> Editar
                </Button>{' '}
                <Button
                  variant={ubicacion.ubicacion_status === 'A' ? 'danger' : 'success'}
                  onClick={() => toggleUbicacion(ubicacion)}
                >
                  <FontAwesomeIcon icon={ubicacion.ubicacion_status === 'A' ? faToggleOff : faToggleOn} />
                  {' '}
                  {ubicacion.ubicacion_status === 'A' ? 'Desactivar' : 'Activar'}
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
            <Button className="page-link" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
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
            <Button className="page-link" onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>
              &raquo;
            </Button>
          </li>
        </ul>
      </nav>

      {/* Modal para agregar o editar ubicación */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{editingUbicacion ? 'Editar Ubicación' : 'Agregar Ubicación'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <UbicacionForm
            ubicacion={editingUbicacion}
            onClose={handleCloseModal}
            refreshUbicaciones={fetchUbicaciones}
          />
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default UbicacionList;
