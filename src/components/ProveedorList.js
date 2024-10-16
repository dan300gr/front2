import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Table, Modal, Form, Dropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faToggleOn, faToggleOff, faPlus, faSearch, faFilter } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2'; // Para alertas
import ProveedorForm from './ProveedorForm'; // Importar el formulario de proveedor

const ProveedorList = () => {
  const [proveedores, setProveedores] = useState([]);
  const [showModal, setShowModal] = useState(false); // Estado para el modal
  const [editingProveedor, setEditingProveedor] = useState(null); // Estado para editar proveedor
  const [searchTerm, setSearchTerm] = useState(''); // Estado para el buscador
  const [sortBy, setSortBy] = useState(''); // Estado para el ordenamiento
  const [filterStatus, setFilterStatus] = useState('todos'); // Filtro por estado (activos, inactivos)
  const [currentPage, setCurrentPage] = useState(1); // Estado para la página actual
  const [itemsPerPage] = useState(10); // Número de elementos por página

  const formatDateTime = (datetime) => {
    const date = new Date(datetime);
    return date.toLocaleString();  // Formatear a cadena legible
  };

  useEffect(() => {
    fetchProveedores();
  }, []);

  const fetchProveedores = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/proveedores/');
      setProveedores(response.data);
    } catch (error) {
      console.error('Error al obtener los proveedores:', error);
    }
  };

  const toggleProveedor = async (proveedor) => {
    try {
      if (proveedor.proveedor_status === 'A') {
        await axios.put(`http://127.0.0.1:8000/proveedores/${proveedor.proveedor_id}/desactivar`);
        Swal.fire({
          icon: 'success',
          title: 'Proveedor desactivado',
          text: 'El proveedor ha sido desactivado exitosamente.',
        });
      } else {
        await axios.put(`http://127.0.0.1:8000/proveedores/${proveedor.proveedor_id}/activar`);
        Swal.fire({
          icon: 'success',
          title: 'Proveedor activado',
          text: 'El proveedor ha sido activado exitosamente.',
        });
      }
      fetchProveedores(); // Recargar la lista de proveedores
    } catch (error) {
      console.error('Error al cambiar el estado del proveedor:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cambiar el estado del proveedor.',
      });
    }
  };

  const handleEdit = (proveedor) => {
    setEditingProveedor(proveedor); // Establecer el proveedor en edición
    setShowModal(true); // Mostrar el modal para editar
  };

  const handleAddProveedor = () => {
    setEditingProveedor(null); // Limpiar el formulario para agregar
    setShowModal(true); // Mostrar el modal para agregar
  };

  const handleCloseModal = () => setShowModal(false); // Cerrar el modal

  // Filtrar proveedores según el término de búsqueda y el estado
  const filteredProveedores = proveedores.filter(proveedor =>
    proveedor.proveedor_nombre.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterStatus === 'todos' || proveedor.proveedor_status === filterStatus)
  );

  // Ordenar proveedores
  const sortedProveedores = [...filteredProveedores].sort((a, b) => {
    if (sortBy === 'nombreAsc') {
      return a.proveedor_nombre.localeCompare(b.proveedor_nombre);
    } else if (sortBy === 'nombreDesc') {
      return b.proveedor_nombre.localeCompare(a.proveedor_nombre);
    } else if (sortBy === 'direccionAsc') {
      return a.proveedor_direccion.localeCompare(b.proveedor_direccion);
    } else if (sortBy === 'direccionDesc') {
      return b.proveedor_direccion.localeCompare(a.proveedor_direccion);
    } else if (sortBy === 'correoAsc') {
      return a.proveedor_correo.localeCompare(b.proveedor_correo);
    } else if (sortBy === 'correoDesc') {
      return b.proveedor_correo.localeCompare(a.proveedor_correo);
    }
    return 0;
  });

  // Paginación
  const indexOfLastProveedor = currentPage * itemsPerPage;
  const indexOfFirstProveedor = indexOfLastProveedor - itemsPerPage;
  const currentProveedores = sortedProveedores.slice(indexOfFirstProveedor, indexOfLastProveedor);
  const totalPages = Math.ceil(sortedProveedores.length / itemsPerPage);

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center my-4">
        <h1>Lista de Proveedores</h1>
        <Button variant="success" onClick={handleAddProveedor}>
          <FontAwesomeIcon icon={faPlus} /> Agregar Proveedor
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
            placeholder="Buscar proveedor"
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
            <Dropdown.Item onClick={() => setSortBy('direccionAsc')}>Dirección A-Z</Dropdown.Item>
            <Dropdown.Item onClick={() => setSortBy('direccionDesc')}>Dirección Z-A</Dropdown.Item>
            <Dropdown.Item onClick={() => setSortBy('correoAsc')}>Correo A-Z</Dropdown.Item>
            <Dropdown.Item onClick={() => setSortBy('correoDesc')}>Correo Z-A</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Dirección</th>
            <th>Teléfono</th>
            <th>Correo</th>
            <th>Estado</th>
            <th>Fecha Modificación</th>
            <th>Acciones</th>
          </tr>
        </thead>
        
        <tbody>
          {currentProveedores.map((proveedor) => (
            <tr key={proveedor.proveedor_id}>
              <td>{proveedor.proveedor_id}</td>
              <td>{proveedor.proveedor_nombre}</td>
              <td>{proveedor.proveedor_direccion}</td>
              <td>{proveedor.proveedor_telefono}</td>
              <td>{proveedor.proveedor_correo}</td>
              <td>{proveedor.proveedor_status === 'A' ? 'Activo' : 'Inactivo'}</td>
              <td>{formatDateTime(proveedor.proveedor_fecha_modificacion)}</td> {/* Mostrar fecha y hora de modificación */}
              <td>
                <Button variant="info" onClick={() => handleEdit(proveedor)}>
                  <FontAwesomeIcon icon={faEdit} /> Editar
                </Button>{' '}
                <Button
                  variant={proveedor.proveedor_status === 'A' ? 'danger' : 'success'}
                  onClick={() => toggleProveedor(proveedor)}
                >
                  <FontAwesomeIcon icon={proveedor.proveedor_status === 'A' ? faToggleOff : faToggleOn} />
                  {' '}
                  {proveedor.proveedor_status === 'A' ? 'Desactivar' : 'Activar'}
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
          <Modal.Title>{editingProveedor ? 'Editar Proveedor' : 'Agregar Proveedor'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ProveedorForm
            proveedor={editingProveedor}
            onClose={handleCloseModal}
            refreshProveedores={fetchProveedores}
          />
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ProveedorList;

