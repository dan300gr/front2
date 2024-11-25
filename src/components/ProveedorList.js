import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Table, Modal, Form, Dropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faPlus, faSearch, faFilter } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import ProveedorForm from './ProveedorForm';

const ProveedorList = () => {
  const [proveedores, setProveedores] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProveedor, setEditingProveedor] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [sortBy, setSortBy] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [estados, setEstados] = useState([]);

  useEffect(() => {
    fetchProveedores();
    fetchEstados();
  }, []);

  const fetchProveedores = async () => {
    try {
      const response = await axios.get('https://api2-uetw.onrender.com/api/proveedores/');
      setProveedores(response.data);
    } catch (error) {
      console.error('Error al obtener los proveedores:', error);
    }
  };

  const fetchEstados = async () => {
    try {
      const response = await axios.get('https://34.134.65.19:5001/estados/api/estados');
      setEstados(response.data);
    } catch (error) {
      console.error('Error al obtener los estados:', error);
    }
  };

  const handleEdit = (proveedor) => {
    setEditingProveedor(proveedor);
    setShowModal(true);
  };

  const handleShowModal = () => {
    setEditingProveedor(null);
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleDelete = async (proveedor_id) => {
    try {
      await axios.delete(`https://api2-uetw.onrender.com/api/proveedores/${proveedor_id}`);
      Swal.fire({
        icon: 'success',
        title: 'Proveedor eliminado',
        text: 'El proveedor ha sido eliminado exitosamente.',
      });
      fetchProveedores();
    } catch (error) {
      console.error('Error al eliminar el proveedor:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar el proveedor.',
      });
    }
  };

  const filteredProveedores = proveedores.filter((proveedor) => {
    const nameMatch = proveedor.proveedor_nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = filterStatus === 'todos' || proveedor.proveedor_status === filterStatus;
    return nameMatch && statusMatch;
  });

  const sortedProveedores = [...filteredProveedores].sort((a, b) => {
    if (sortBy === 'nombreAsc') {
      return a.proveedor_nombre.localeCompare(b.proveedor_nombre);
    } else if (sortBy === 'nombreDesc') {
      return b.proveedor_nombre.localeCompare(a.proveedor_nombre);
    }
    return 0;
  });

  const indexOfLastProveedor = currentPage * itemsPerPage;
  const indexOfFirstProveedor = indexOfLastProveedor - itemsPerPage;
  const currentProveedores = sortedProveedores.slice(indexOfFirstProveedor, indexOfLastProveedor);
  const totalPages = Math.ceil(sortedProveedores.length / itemsPerPage);

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center my-4">
        <h1>Lista de Proveedores</h1>
        <Button variant="success" onClick={handleShowModal}>
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
            <Dropdown.Item onClick={() => setSortBy('nombreAsc')}>Proveedor A-Z</Dropdown.Item>
            <Dropdown.Item onClick={() => setSortBy('nombreDesc')}>Proveedor Z-A</Dropdown.Item>
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
              <td>
                <Button variant="info" onClick={() => handleEdit(proveedor)}>
                  <FontAwesomeIcon icon={faEdit} /> Editar
                </Button>{' '}
                <Button
                  variant="danger"
                  onClick={() => handleDelete(proveedor.proveedor_id)}
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

      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingProveedor ? 'Editar Proveedor' : 'Agregar Proveedor'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ProveedorForm 
            proveedor={editingProveedor} 
            onClose={handleCloseModal} 
            refreshProveedores={fetchProveedores} 
            estados={estados}
          />
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ProveedorList;


