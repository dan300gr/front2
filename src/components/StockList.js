import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Table, Modal, Form, Dropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faToggleOn, faToggleOff, faPlus, faSearch, faFilter } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2'; // Importar SweetAlert2
import StockForm from './StockForm'; // Importamos el formulario para usarlo en el modal

const StockList = () => {
  const [stocks, setStocks] = useState([]);
  const [showModal, setShowModal] = useState(false); // Estado para el modal
  const [editingStock, setEditingStock] = useState(null); // Estado para editar stock
  const [searchTerm, setSearchTerm] = useState(''); // Estado para el buscador
  const [sortBy, setSortBy] = useState(''); // Estado para el ordenamiento
  const [filterStatus, setFilterStatus] = useState('todos'); // Estado para el filtro de estado
  const [currentPage, setCurrentPage] = useState(1); // Estado para la página actual
  const [itemsPerPage] = useState(10); // Número de elementos por página
  const [productos, setProductos] = useState([]); // Estado para productos

  useEffect(() => {
    fetchStocks();
    fetchProductos();
  }, []);

  const fetchStocks = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/stocks/');
      setStocks(response.data); // Asegurarnos de que obtenemos tanto los activos como los inactivos
    } catch (error) {
      console.error('Error al obtener los stocks:', error);
    }
  };

  const fetchProductos = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/productos/');
      setProductos(response.data); // Cargar la lista de productos
    } catch (error) {
      console.error('Error al obtener los productos:', error);
    }
  };

  const formatDateTime = (datetime) => {
    const date = new Date(datetime);
    return date.toLocaleString();  // Formatear a cadena legible
  };

  const toggleStock = async (stock) => {
    try {
      if (stock.stock_status === 'A') {
        await axios.put(`http://127.0.0.1:8000/stocks/${stock.stock_id}/desactivar`);
        Swal.fire({
          icon: 'success',
          title: 'Stock desactivado',
          text: 'El stock ha sido desactivado exitosamente.',
        });
      } else {
        await axios.put(`http://127.0.0.1:8000/stocks/${stock.stock_id}/activar`);
        Swal.fire({
          icon: 'success',
          title: 'Stock activado',
          text: 'El stock ha sido activado exitosamente.',
        });
      }
      fetchStocks(); // Recargar la lista de stocks
    } catch (error) {
      console.error('Error al cambiar el estado del stock:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cambiar el estado del stock.',
      });
    }
  };

  const handleEdit = (stock) => {
    setEditingStock(stock); // Establecer el stock en edición
    setShowModal(true); // Mostrar el modal para editar
  };

  const handleAddStock = () => {
    setEditingStock(null); // Limpiar el formulario para agregar
    setShowModal(true); // Mostrar el modal para agregar
  };

  const handleCloseModal = () => setShowModal(false); // Cerrar el modal

  // Filtrar stocks según el término de búsqueda y el estado
  const filteredStocks = stocks.filter(stock =>
    stock.stock_id.toString().includes(searchTerm) &&
    (filterStatus === 'todos' || stock.stock_status === filterStatus)
  );

  // Ordenar stocks
  const sortedStocks = [...filteredStocks].sort((a, b) => {
    if (sortBy === 'nombreAsc') {
      return a.stock_id - b.stock_id; // Suponiendo que se desea ordenar por ID de stock
    } else if (sortBy === 'nombreDesc') {
      return b.stock_id - a.stock_id; // Suponiendo que se desea ordenar por ID de stock
    } else if (sortBy === 'productoAsc') {
      return productos.find(p => p.producto_id === a.producto_id)?.producto_nombre.localeCompare(
        productos.find(p => p.producto_id === b.producto_id)?.producto_nombre
      ) || 0;
    } else if (sortBy === 'productoDesc') {
      return productos.find(p => p.producto_id === b.producto_id)?.producto_nombre.localeCompare(
        productos.find(p => p.producto_id === a.producto_id)?.producto_nombre
      ) || 0;
    }
    return 0;
  });

  // Paginación
  const indexOfLastStock = currentPage * itemsPerPage;
  const indexOfFirstStock = indexOfLastStock - itemsPerPage;
  const currentStocks = sortedStocks.slice(indexOfFirstStock, indexOfLastStock);

  const totalPages = Math.ceil(sortedStocks.length / itemsPerPage);

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center my-4">
        <h1>Lista de Stocks</h1>
        <Button variant="success" onClick={handleAddStock}>
          <FontAwesomeIcon icon={faPlus} /> Agregar Stock
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

        {/* Buscador */}
        <div style={{ position: 'relative', width: '200px' }}>
          <Form.Control
            type="text"
            placeholder="Buscar stock"
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
            <Dropdown.Item onClick={() => setSortBy('nombreAsc')}>ID Ascendente</Dropdown.Item>
            <Dropdown.Item onClick={() => setSortBy('nombreDesc')}>ID Descendente</Dropdown.Item>
            <Dropdown.Item onClick={() => setSortBy('productoAsc')}>Producto A-Z</Dropdown.Item>
            <Dropdown.Item onClick={() => setSortBy('productoDesc')}>Producto Z-A</Dropdown.Item>
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
            <th>Fecha Modificación</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {currentStocks.map((stock) => (
            <tr key={stock.stock_id}>
              <td>{stock.stock_id}</td>
              <td>{productos.find(p => p.producto_id === stock.producto_id)?.producto_nombre || 'Sin Producto'}</td>
              <td>{stock.stock_cantidad}</td>
              <td>{stock.stock_status === 'A' ? 'Activo' : 'Inactivo'}</td>
              <td>{formatDateTime(stock.stock_fecha_modificacion)}</td>
              <td>
                <Button variant="info" onClick={() => handleEdit(stock)}>
                  <FontAwesomeIcon icon={faEdit} /> Editar
                </Button>{' '}
                <Button
                  variant={stock.stock_status === 'A' ? 'danger' : 'success'}
                  onClick={() => toggleStock(stock)}
                >
                  <FontAwesomeIcon icon={stock.stock_status === 'A' ? faToggleOff : faToggleOn} />
                  {' '}
                  {stock.stock_status === 'A' ? 'Desactivar' : 'Activar'}
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
              &raquo; {/* Flecha derecha */}
            </Button>
          </li>
        </ul>
      </nav>

      {/* Modal para agregar o editar stock */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{editingStock ? 'Editar Stock' : 'Agregar Stock'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <StockForm
            stock={editingStock}
            onClose={handleCloseModal}
            refreshStocks={fetchStocks} // Refrescar la lista después de agregar/editar
            productos={productos} // Pasar productos al formulario
          />
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default StockList;
