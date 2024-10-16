import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Table, Modal, Form, Dropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faToggleOn, faToggleOff, faPlus, faSearch, faFilter } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2'; // Importar SweetAlert2
import EdificioForm from './EdificioForm'; // Importamos el formulario para usarlo en el modal

const EdificioList = () => {
  const [edificios, setEdificios] = useState([]);
  const [showModal, setShowModal] = useState(false); // Estado para el modal
  const [editingEdificio, setEditingEdificio] = useState(null); // Estado para editar edificio
  const [searchTerm, setSearchTerm] = useState(''); // Estado para el buscador
  const [sortBy, setSortBy] = useState(''); // Estado para el ordenamiento
  const [filterStatus, setFilterStatus] = useState('todos'); // Estado para el filtro de estado
  const [currentPage, setCurrentPage] = useState(1); // Estado para la página actual
  const [itemsPerPage] = useState(10); // Número de elementos por página

  useEffect(() => {
    fetchEdificios();
  }, []);

  const fetchEdificios = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/edificios/');
      setEdificios(response.data); // Asegurarnos de que obtenemos tanto los activos como los inactivos
    } catch (error) {
      console.error('Error al obtener los edificios:', error);
    }
  };

  const formatDateTime = (datetime) => {
    const date = new Date(datetime);
    return date.toLocaleString();  // Formatear a cadena legible
  };

  const toggleEdificio = async (edificio) => {
    try {
      if (edificio.edificio_status === 'A') {
        await axios.put(`http://127.0.0.1:8000/edificios/${edificio.edificio_id}/desactivar`);
        Swal.fire({
          icon: 'success',
          title: 'Edificio desactivado',
          text: 'El edificio ha sido desactivado exitosamente.',
        });
      } else {
        await axios.put(`http://127.0.0.1:8000/edificios/${edificio.edificio_id}/activar`);
        Swal.fire({
          icon: 'success',
          title: 'Edificio activado',
          text: 'El edificio ha sido activado exitosamente.',
        });
      }
      fetchEdificios(); // Recargar la lista de edificios
    } catch (error) {
      console.error('Error al cambiar el estado del edificio:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cambiar el estado del edificio.',
      });
    }
  };

  const handleEdit = (edificio) => {
    setEditingEdificio(edificio); // Establecer el edificio en edición
    setShowModal(true); // Mostrar el modal para editar
  };

  const handleAddEdificio = () => {
    setEditingEdificio(null); // Limpiar el formulario para agregar
    setShowModal(true); // Mostrar el modal para agregar
  };

  const handleCloseModal = () => setShowModal(false); // Cerrar el modal

  // Filtrar edificios según el término de búsqueda y el estado
  const filteredEdificios = edificios.filter(edificio =>
    edificio.edificio_nombre.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterStatus === 'todos' || edificio.edificio_status === filterStatus)
  );

  // Ordenar edificios
  const sortedEdificios = [...filteredEdificios].sort((a, b) => {
    if (sortBy === 'nombreAsc') {
      return a.edificio_nombre.localeCompare(b.edificio_nombre);
    } else if (sortBy === 'nombreDesc') {
      return b.edificio_nombre.localeCompare(a.edificio_nombre);
    } else if (sortBy === 'direccionAsc') {
      return a.edificio_direccion.localeCompare(b.edificio_direccion);
    } else if (sortBy === 'direccionDesc') {
      return b.edificio_direccion.localeCompare(a.edificio_direccion);
    }
    return 0;
  });

  // Paginación
  const indexOfLastEdificio = currentPage * itemsPerPage;
  const indexOfFirstEdificio = indexOfLastEdificio - itemsPerPage;
  const currentEdificios = sortedEdificios.slice(indexOfFirstEdificio, indexOfLastEdificio);

  const totalPages = Math.ceil(sortedEdificios.length / itemsPerPage);

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center my-4">
        <h1>Lista de Edificios</h1>
        <Button variant="success" onClick={handleAddEdificio}>
          <FontAwesomeIcon icon={faPlus} /> Agregar Edificio
        </Button>
      </div>

      <div className="d-flex mb-3 justify-content-between">
        {/* Filtro por estado */}
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
            placeholder="Buscar edificio"
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
        {/* Ordenar con icono de filtro */}
        <Dropdown>
          <Dropdown.Toggle variant="outline-secondary" id="dropdown-basic" className="d-flex align-items-center">
            <FontAwesomeIcon icon={faFilter} style={{ marginRight: '5px' }} />
            Ordenar
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <Dropdown.Item onClick={() => setSortBy('nombreAsc')}>Nombre A-Z</Dropdown.Item>
            <Dropdown.Item onClick={() => setSortBy('nombreDesc')}>Nombre Z-A</Dropdown.Item>
            <Dropdown.Item onClick={() => setSortBy('direccionAsc')}>Dirección A-Z</Dropdown.Item>
            <Dropdown.Item onClick={() => setSortBy('direccionDesc')}>Dirección Z-A</Dropdown.Item>
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
            <th>Fecha Modificación</th>
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
              <td>{formatDateTime(edificio.edificio_fecha_modificacion)}</td> {/* Mostrar fecha y hora de modificación */}
              <td>
                <Button variant="info" onClick={() => handleEdit(edificio)}>
                  <FontAwesomeIcon icon={faEdit} /> Editar
                </Button>{' '}
                <Button
                  variant={edificio.edificio_status === 'A' ? 'danger' : 'success'}
                  onClick={() => toggleEdificio(edificio)}
                >
                  <FontAwesomeIcon icon={edificio.edificio_status === 'A' ? faToggleOff : faToggleOn} />
                  {' '}
                  {edificio.edificio_status === 'A' ? 'Desactivar' : 'Activar'}
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

      {/* Modal para agregar o editar edificio */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{editingEdificio ? 'Editar Edificio' : 'Agregar Edificio'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <EdificioForm
            edificio={editingEdificio}
            onClose={handleCloseModal}
            refreshEdificios={fetchEdificios} // Refrescar la lista después de agregar/editar
          />
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default EdificioList;

