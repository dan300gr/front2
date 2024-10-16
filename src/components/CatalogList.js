import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Table, Modal, Form, Dropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faToggleOn, faToggleOff, faPlus, faSearch, faFilter } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2'; // Importar SweetAlert2
import CatalogForm from './CatalogForm'; // Importamos el formulario para usarlo en el modal

const CatalogList = () => {
  const [catalogos, setCatalogos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCatalogo, setEditingCatalogo] = useState(null);
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
    fetchCatalogos();
  }, []);

  const fetchCatalogos = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/catalogos/');
      setCatalogos(response.data);
    } catch (error) {
      console.error('Error al obtener los catálogos:', error);
    }
  };

  const toggleCatalogo = async (catalogo) => {
    try {
      if (catalogo.catalogo_status === 'A') {
        await axios.put(`http://127.0.0.1:8000/catalogos/${catalogo.catalogo_id}/desactivar`);
        Swal.fire({
          icon: 'success',
          title: 'Catálogo desactivado',
          text: 'El catálogo ha sido desactivado exitosamente.',
        });
      } else {
        await axios.put(`http://127.0.0.1:8000/catalogos/${catalogo.catalogo_id}/activar`);
        Swal.fire({
          icon: 'success',
          title: 'Catálogo activado',
          text: 'El catálogo ha sido activado exitosamente.',
        });
      }
      fetchCatalogos(); // Recargar la lista de catálogos
    } catch (error) {
      console.error('Error al cambiar el estado del catálogo:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo desativar el catálogo debido a que está asociado a otros elementos activos.',
      });
    }
  };

  const handleEdit = (catalogo) => {
    setEditingCatalogo(catalogo);
    setShowModal(true);
  };

  const handleAddCatalog = () => {
    setEditingCatalogo(null); // Limpiar el formulario para agregar
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  // Filtrar catálogos según el término de búsqueda y el estado
  const filteredCatalogos = catalogos.filter(catalogo =>
    catalogo.catalogo_nombre.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterStatus === 'todos' || catalogo.catalogo_status === filterStatus)
  );

  // Ordenar catálogos
  const sortedCatalogos = [...filteredCatalogos].sort((a, b) => {
    if (sortBy === 'catalogoAsc') {
      return a.catalogo_nombre.localeCompare(b.catalogo_nombre);
    } else if (sortBy === 'catalogoDesc') {
      return b.catalogo_nombre.localeCompare(a.catalogo_nombre);
    }
    return 0;
  });

  // Paginación
  const indexOfLastCatalogo = currentPage * itemsPerPage;
  const indexOfFirstCatalogo = indexOfLastCatalogo - itemsPerPage;
  const currentCatalogos = sortedCatalogos.slice(indexOfFirstCatalogo, indexOfLastCatalogo);
  const totalPages = Math.ceil(sortedCatalogos.length / itemsPerPage);

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center my-4">
        <h1>Lista de Catálogos</h1>
        <Button variant="success" onClick={handleAddCatalog}>
          <FontAwesomeIcon icon={faPlus} /> Agregar Catálogo
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
            placeholder="Buscar catálogo"
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
            <Dropdown.Item onClick={() => setSortBy('catalogoAsc')}>Catálogo A-Z</Dropdown.Item>
            <Dropdown.Item onClick={() => setSortBy('catalogoDesc')}>Catálogo Z-A</Dropdown.Item>
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
          {currentCatalogos.map((catalogo) => (
            <tr key={catalogo.catalogo_id}>
              <td>{catalogo.catalogo_id}</td>
              <td>{catalogo.catalogo_nombre}</td>
              <td>{catalogo.catalogo_status === 'A' ? 'Activo' : 'Inactivo'}</td>
              <td>{formatDateTime(catalogo.catalogo_fecha_modificacion)}</td> {/* Mostrar fecha y hora de modificación */}
              <td>
                <Button variant="info" onClick={() => handleEdit(catalogo)}>
                  <FontAwesomeIcon icon={faEdit} /> Editar
                </Button>{' '}
                <Button
                  variant={catalogo.catalogo_status === 'A' ? 'danger' : 'success'}
                  onClick={() => toggleCatalogo(catalogo)}
                >
                  <FontAwesomeIcon icon={catalogo.catalogo_status === 'A' ? faToggleOff : faToggleOn} />
                  {' '}
                  {catalogo.catalogo_status === 'A' ? 'Desactivar' : 'Activar'}
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

      {/* Modal para agregar o editar catálogo */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{editingCatalogo ? 'Editar Catálogo' : 'Agregar Catálogo'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <CatalogForm
            catalogo={editingCatalogo}
            onClose={handleCloseModal}
            refreshCatalogos={fetchCatalogos}
          />
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default CatalogList;
