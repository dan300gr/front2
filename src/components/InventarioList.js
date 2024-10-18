import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Table, Modal, Form, Dropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faPlus, faSearch, faFilter } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import InventarioForm from './InventarioForm'; // Asegúrate de crear este formulario también

const InventarioList = () => {
  const [inventarios, setInventarios] = useState([]);
  const [productos, setProductos] = useState([]);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingInventario, setEditingInventario] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [sortBy, setSortBy] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  useEffect(() => {
    fetchInventarios();
    fetchProductos();
    fetchUbicaciones();
    fetchStocks();
  }, []);

  const fetchInventarios = async () => {
    try {
      const response = await axios.get('https://20.246.139.92/api/inventarios/');
      setInventarios(response.data);
    } catch (error) {
      console.error('Error al obtener los inventarios:', error);
    }
  };

  const fetchProductos = async () => {
    try {
      const response = await axios.get('https://20.246.139.92/api/productos/');
      const activos = response.data.filter(producto => producto.producto_status === 'A');
      setProductos(activos);
    } catch (error) {
      console.error('Error al obtener los productos:', error);
    }
  };

  const fetchUbicaciones = async () => {
    try {
      const response = await axios.get('https://20.246.139.92/api/ubicaciones/');
      const activos = response.data.filter(ubicacion => ubicacion.ubicacion_status === 'A');
      setUbicaciones(activos);
    } catch (error) {
      console.error('Error al obtener las ubicaciones:', error);
    }
  };

  const fetchStocks = async () => {
    try {
      const response = await axios.get('https://20.246.139.92/api/stocks/');
      const activos = response.data.filter(stock => stock.stock_status === 'A');
      setStocks(activos);
    } catch (error) {
      console.error('Error al obtener los stocks:', error);
    }
  };

  const handleEdit = (inventario) => {
    setEditingInventario(inventario);
    setShowModal(true);
  };

  const handleShowModal = () => {
    setEditingInventario(null);
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleDelete = async (inventario_id) => {
    try {
      await axios.delete(`https://20.246.139.92/api/inventarios/${inventario_id}`);
      Swal.fire({
        icon: 'success',
        title: 'Inventario eliminado',
        text: 'El inventario ha sido eliminado exitosamente.',
      });
      fetchInventarios();
    } catch (error) {
      console.error('Error al eliminar el inventario:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar el inventario.',
      });
    }
  };

  const filteredInventarios = inventarios.filter((inventario) => {
    const producto = productos.find(p => p.producto_id === inventario.producto_id);
    const ubicacion = ubicaciones.find(u => u.ubicacion_id === inventario.ubicacion_id);
    const nombreProducto = producto ? producto.producto_nombre : '';
    const nombreUbicacion = ubicacion ? ubicacion.ubicacion_nombre : '';
    const nameMatch = nombreProducto.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      nombreUbicacion.toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = filterStatus === 'todos' || inventario.inventario_status === filterStatus;
    return nameMatch && statusMatch;
  });

  const sortedInventarios = [...filteredInventarios].sort((a, b) => {
    const productoA = productos.find(p => p.producto_id === a.producto_id);
    const productoB = productos.find(p => p.producto_id === b.producto_id);
    const nombreA = productoA ? productoA.producto_nombre : '';
    const nombreB = productoB ? productoB.producto_nombre : '';
    
    if (sortBy === 'nombreAsc') {
      return nombreA.localeCompare(nombreB);
    } else if (sortBy === 'nombreDesc') {
      return nombreB.localeCompare(nombreA);
    }
    return 0;
  });

  const indexOfLastInventario = currentPage * itemsPerPage;
  const indexOfFirstInventario = indexOfLastInventario - itemsPerPage;
  const currentInventarios = sortedInventarios.slice(indexOfFirstInventario, indexOfLastInventario);
  const totalPages = Math.ceil(sortedInventarios.length / itemsPerPage);

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center my-4">
        <h1>Lista de Inventarios</h1>
        <Button variant="success" onClick={handleShowModal}>
          <FontAwesomeIcon icon={faPlus} /> Agregar Inventario
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
            <Dropdown.Item onClick={() => setSortBy('nombreAsc')}>Producto A-Z</Dropdown.Item>
            <Dropdown.Item onClick={() => setSortBy('nombreDesc')}>Producto Z-A</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Producto</th>
            <th>Ubicación</th>
            <th>Stock</th>
            <th>Cantidad</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {currentInventarios.map((inventario) => {
            const producto = productos.find(p => p.producto_id === inventario.producto_id);
            const ubicacion = ubicaciones.find(u => u.ubicacion_id === inventario.ubicacion_id);
            const stock = stocks.find(s => s.stock_id === inventario.stock_id);
            const nombreProducto = producto ? producto.producto_nombre : 'Desconocido';
            const nombreUbicacion = ubicacion ? ubicacion.ubicacion_nombre : 'Desconocida';
            const nombreStock = stock ? stock.stock_id : 'Desconocido'; // Agrega el manejo de nombres desconocidos

            return (
              <tr key={inventario.inventario_id}>
                <td>{inventario.inventario_id}</td>
                <td>{nombreProducto}</td>
                <td>{nombreUbicacion}</td>
                <td>{nombreStock}</td>
                <td>{inventario.inventario_cantidad}</td>
                <td>{inventario.inventario_status === 'A' ? 'Activo' : 'Inactivo'}</td>
                <td>
                  <Button variant="info" onClick={() => handleEdit(inventario)}>
                    <FontAwesomeIcon icon={faEdit} />
                  </Button>
                  <Button variant="danger" onClick={() => handleDelete(inventario.inventario_id)}>
                    Eliminar
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>

      <div className="d-flex justify-content-between">
        <Button 
          variant="primary" 
          disabled={currentPage === 1} 
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          Anterior
        </Button>
        <Button 
          variant="primary" 
          disabled={currentPage === totalPages} 
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          Siguiente
        </Button>
      </div>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{editingInventario ? 'Editar Inventario' : 'Agregar Inventario'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <InventarioForm 
            inventario={editingInventario} 
            onClose={handleCloseModal} 
            onSave={fetchInventarios} 
            productos={productos}
            ubicaciones={ubicaciones}
            stocks={stocks}
          />
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default InventarioList;

