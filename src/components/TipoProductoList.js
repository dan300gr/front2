import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Table, Modal, Form, Dropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faToggleOn, faToggleOff, faPlus, faSearch, faFilter } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import TipoProductoForm from './TipoProductoForm';

const TipoProductoList = () => {
  const [tiposProductos, setTiposProductos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTipoProducto, setEditingTipoProducto] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [sortBy, setSortBy] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const formatDateTime = (datetime) => {
    const date = new Date(datetime);
    return date.toLocaleString();
  };

  useEffect(() => {
    fetchTiposProductos();
  }, []);

  const fetchTiposProductos = async () => {
    try {
      const response = await axios.get('https://api2-uetw.onrender.com/api/tipos-producto/');
      setTiposProductos(response.data);
    } catch (error) {
      console.error('Error al obtener los tipos de productos:', error);
    }
  };

  const handleEdit = (tipoProducto) => {
    setEditingTipoProducto(tipoProducto);
    setShowModal(true);
  };

  const handleShowModal = () => {
    setEditingTipoProducto(null);
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleDelete = async (tipo_id) => {
    try {
      // Verificar si el tipo de producto está asociado a algún producto
      const productsResponse = await axios.get('https://api2-uetw.onrender.com/api/productos/');
      const products = productsResponse.data;
      const isTipoInProducts = products.some(product => product.tipo_id === tipo_id);

      if (isTipoInProducts) {
        Swal.fire({
          icon: 'warning',
          title: 'Advertencia',
          text: 'No se puede eliminar el tipo de producto porque está asociado a productos.',
        });
        return;
      }

      await axios.delete(`https://api2-uetw.onrender.com/api/tipos-producto/${tipo_id}`);
      Swal.fire({
        icon: 'success',
        title: 'Tipo de Producto eliminado',
        text: 'El tipo de producto ha sido eliminado exitosamente.',
      });
      fetchTiposProductos();
    } catch (error) {
      console.error('Error al eliminar el tipo de producto:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar el tipo de producto.',
      });
    }
  };

  const filteredTiposProductos = tiposProductos.filter((tipo) =>
    tipo.tipo_nombre.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterStatus === 'todos' || tipo.tipo_status === filterStatus)
  );

  const sortedTiposProductos = [...filteredTiposProductos].sort((a, b) => {
    if (sortBy === 'tipoAsc') {
      return a.tipo_nombre.localeCompare(b.tipo_nombre);
    } else if (sortBy === 'tipoDesc') {
      return b.tipo_nombre.localeCompare(a.tipo_nombre);
    }
    return 0;
  });

  const indexOfLastTipoProducto = currentPage * itemsPerPage;
  const indexOfFirstTipoProducto = indexOfLastTipoProducto - itemsPerPage;
  const currentTiposProductos = sortedTiposProductos.slice(indexOfFirstTipoProducto, indexOfLastTipoProducto);
  const totalPages = Math.ceil(sortedTiposProductos.length / itemsPerPage);

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center my-4">
        <h1>Lista de Tipos de Productos</h1>
        <Button variant="success" onClick={handleShowModal}>
          <FontAwesomeIcon icon={faPlus} /> Agregar Tipo de Producto
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
            <Dropdown.Item onClick={() => setSortBy('tipoAsc')}>Tipo de Producto A-Z</Dropdown.Item>
            <Dropdown.Item onClick={() => setSortBy('tipoDesc')}>Tipo de Producto Z-A</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {currentTiposProductos.map((tipoProducto) => (
            <tr key={tipoProducto.tipo_id}>
              <td>{tipoProducto.tipo_id}</td>
              <td>{tipoProducto.tipo_nombre}</td>
              <td>{tipoProducto.tipo_status === 'A' ? 'Activo' : 'Inactivo'}</td>
              <td>
                <Button variant="info" onClick={() => handleEdit(tipoProducto)}>
                  <FontAwesomeIcon icon={faEdit} /> Editar
                </Button>{' '}
                <Button
                  variant="danger"
                  onClick={() => handleDelete(tipoProducto.tipo_id)}
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
          <Modal.Title>{editingTipoProducto ? 'Editar Tipo de Producto' : 'Agregar Tipo de Producto'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <TipoProductoForm tipoProducto={editingTipoProducto} onClose={handleCloseModal} refreshTiposProductos={fetchTiposProductos} />
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default TipoProductoList;
