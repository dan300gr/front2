import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Table, Modal, Form, Dropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faPlus, faSearch, faFilter } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import StockForm from './StockForm'; // Asegúrate de crear este formulario también

const StockList = () => {
  const [stocks, setStocks] = useState([]);
  const [productos, setProductos] = useState([]); // Nuevo estado para almacenar productos
  const [showModal, setShowModal] = useState(false);
  const [editingStock, setEditingStock] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [sortBy, setSortBy] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  useEffect(() => {
    fetchStocks();
    fetchProductos(); // Llama a la función para obtener productos
  }, []);

  const fetchStocks = async () => {
    try {
      const response = await axios.get('https://20.246.139.92/api/stocks/');
      setStocks(response.data);
    } catch (error) {
      console.error('Error al obtener los stocks:', error);
    }
  };

  const fetchProductos = async () => {
    try {
      const response = await axios.get('https://20.246.139.92/api/productos/'); // Asegúrate de que este endpoint sea correcto
      setProductos(response.data);
    } catch (error) {
      console.error('Error al obtener los productos:', error);
    }
  };

  const handleEdit = (stock) => {
    setEditingStock(stock);
    setShowModal(true);
  };

  const handleShowModal = () => {
    setEditingStock(null);
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleDelete = async (stock_id) => {
    try {
      // Comprobar si el stock está asociado a algún inventario
      const inventariosResponse = await axios.get('https://20.246.139.92/api/inventarios/');
      const inventarios = inventariosResponse.data;
      const isStockInInventarios = inventarios.some(inventario => inventario.stock_id === stock_id);

      if (isStockInInventarios) {
        Swal.fire({
          icon: 'warning',
          title: 'Advertencia',
          text: 'No se puede eliminar el stock porque está asociado a inventarios.',
        });
        return;
      }

      await axios.delete(`https://20.246.139.92/api/stocks/${stock_id}`);
      Swal.fire({
        icon: 'success',
        title: 'Stock eliminado',
        text: 'El stock ha sido eliminado exitosamente.',
      });
      fetchStocks();
    } catch (error) {
      console.error('Error al eliminar el stock:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar el stock.',
      });
    }
  };

  const filteredStocks = stocks.filter((stock) => {
    const producto = productos.find(p => p.producto_id === stock.producto_id); // Encuentra el producto correspondiente
    const nombreProducto = producto ? producto.producto_nombre : ''; // Obtiene el nombre del producto o una cadena vacía
    const nameMatch = nombreProducto.toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = filterStatus === 'todos' || stock.stock_status === filterStatus;
    return nameMatch && statusMatch;
  });

  const sortedStocks = [...filteredStocks].sort((a, b) => {
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

  const indexOfLastStock = currentPage * itemsPerPage;
  const indexOfFirstStock = indexOfLastStock - itemsPerPage;
  const currentStocks = sortedStocks.slice(indexOfFirstStock, indexOfLastStock);
  const totalPages = Math.ceil(sortedStocks.length / itemsPerPage);

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center my-4">
        <h1>Lista de Stocks</h1>
        <Button variant="success" onClick={handleShowModal}>
          <FontAwesomeIcon icon={faPlus} /> Agregar Stock
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
            <th>Cantidad</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {currentStocks.map((stock) => {
            const producto = productos.find(p => p.producto_id === stock.producto_id);
            const nombreProducto = producto ? producto.producto_nombre : 'Desconocido'; // Manejo de nombres desconocidos
            return (
              <tr key={stock.stock_id}>
                <td>{stock.stock_id}</td>
                <td>{nombreProducto}</td>
                <td>{stock.stock_cantidad}</td>
                <td>{stock.stock_status === 'A' ? 'Activo' : 'Inactivo'}</td>
                <td>
                  <Button variant="info" onClick={() => handleEdit(stock)}>
                    <FontAwesomeIcon icon={faEdit} /> Editar
                  </Button>{' '}
                  <Button
                    variant="danger"
                    onClick={() => handleDelete(stock.stock_id)}
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
          <Modal.Title>{editingStock ? 'Editar Stock' : 'Agregar Stock'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <StockForm stock={editingStock} onClose={handleCloseModal} refreshStocks={fetchStocks} />
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default StockList;
