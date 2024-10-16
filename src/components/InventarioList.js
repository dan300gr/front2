import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Table, Modal, Form, Dropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faToggleOn, faToggleOff, faPlus, faSearch, faFilter } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2'; // Importar SweetAlert2
import InventarioForm from './InventarioForm'; // Importamos el formulario para usarlo en el modal

const InventarioList = () => {
  const [inventarios, setInventarios] = useState([]);
  const [showModal, setShowModal] = useState(false); // Estado para el modal
  const [editingInventario, setEditingInventario] = useState(null); // Estado para editar inventario
  const [searchTerm, setSearchTerm] = useState(''); // Estado para el buscador
  const [sortBy, setSortBy] = useState(''); // Estado para el ordenamiento
  const [filterStatus, setFilterStatus] = useState('todos'); // Estado para el filtro de estado
  const [currentPage, setCurrentPage] = useState(1); // Estado para la página actual
  const [itemsPerPage] = useState(10); // Número de elementos por página
  const [ubicaciones, setUbicaciones] = useState([]); // Estado para las ubicaciones
  const [productos, setProductos] = useState([]); // Estado para los productos

  useEffect(() => {
    fetchInventarios();
    fetchUbicaciones();
    fetchProductos();
  }, []);

  const fetchInventarios = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/inventarios/');
      setInventarios(response.data); // Obtener todos los inventarios
    } catch (error) {
      console.error('Error al obtener los inventarios:', error);
    }
  };

  const fetchUbicaciones = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/ubicaciones/');
      const ubicacionesActivas = response.data.filter(ubicacion => ubicacion.ubicacion_status === 'A'); // Filtrar ubicaciones activas
      setUbicaciones(ubicacionesActivas); // Cargar ubicaciones activas
    } catch (error) {
      console.error('Error al obtener las ubicaciones:', error);
    }
  };

  const fetchProductos = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/productos/');
      const productosActivos = response.data.filter(producto => producto.producto_status === 'A'); // Filtrar productos activos
      setProductos(productosActivos); // Cargar productos activos
    } catch (error) {
      console.error('Error al obtener los productos:', error);
    }
  };

  const formatDateTime = (datetime) => {
    const date = new Date(datetime);
    return date.toLocaleString();  // Formatear la fecha y hora
  };

  const toggleInventario = async (inventario) => {
    try {
      if (inventario.inventario_status === 'A') {
        await axios.put(`http://127.0.0.1:8000/inventarios/${inventario.inventario_id}/desactivar`);
        Swal.fire({
          icon: 'success',
          title: 'Inventario desactivado',
          text: 'El inventario ha sido desactivado exitosamente.',
        });
      } else {
        await axios.put(`http://127.0.0.1:8000/inventarios/${inventario.inventario_id}/activar`);
        Swal.fire({
          icon: 'success',
          title: 'Inventario activado',
          text: 'El inventario ha sido activado exitosamente.',
        });
      }
      fetchInventarios(); // Recargar la lista de inventarios
    } catch (error) {
      console.error('Error al cambiar el estado del inventario:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cambiar el estado del inventario.',
      });
    }
  };

  const handleEdit = (inventario) => {
    setEditingInventario(inventario); // Establecer el inventario en edición
    setShowModal(true); // Mostrar el modal para editar
  };

  const handleAddInventario = () => {
    setEditingInventario(null); // Limpiar el formulario para agregar
    setShowModal(true); // Mostrar el modal para agregar
  };

  const handleCloseModal = () => setShowModal(false); // Cerrar el modal

  // Filtrar inventarios según el término de búsqueda y el estado
  const filteredInventarios = inventarios.filter(inventario =>
    inventario.inventario_id.toString().includes(searchTerm) &&
    (filterStatus === 'todos' || inventario.inventario_status === filterStatus)
  );

  // Ordenar inventarios
  const sortedInventarios = [...filteredInventarios].sort((a, b) => {
    if (sortBy === 'nombreAsc') {
      return a.inventario_id - b.inventario_id; // Ordenar por ID de inventario
    } else if (sortBy === 'nombreDesc') {
      return b.inventario_id - a.inventario_id;
    } else if (sortBy === 'ubicacionAsc') {
      return ubicaciones.find(u => u.ubicacion_id === a.ubicacion_id)?.ubicacion_nombre.localeCompare(
        ubicaciones.find(u => u.ubicacion_id === b.ubicacion_id)?.ubicacion_nombre
      ) || 0;
    } else if (sortBy === 'ubicacionDesc') {
      return ubicaciones.find(u => u.ubicacion_id === b.ubicacion_id)?.ubicacion_nombre.localeCompare(
        ubicaciones.find(u => u.ubicacion_id === a.ubicacion_id)?.ubicacion_nombre
      ) || 0;
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
  const indexOfLastInventario = currentPage * itemsPerPage;
  const indexOfFirstInventario = indexOfLastInventario - itemsPerPage;
  const currentInventarios = sortedInventarios.slice(indexOfFirstInventario, indexOfLastInventario);

  const totalPages = Math.ceil(sortedInventarios.length / itemsPerPage);

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center my-4">
        <h1>Lista de Inventarios</h1>
        <Button variant="success" onClick={handleAddInventario}>
          <FontAwesomeIcon icon={faPlus} /> Agregar Inventario
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
            placeholder="Buscar inventario"
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
            <Dropdown.Item onClick={() => setSortBy('ubicacionAsc')}>Ubicación A-Z</Dropdown.Item>
            <Dropdown.Item onClick={() => setSortBy('ubicacionDesc')}>Ubicación Z-A</Dropdown.Item>
            <Dropdown.Item onClick={() => setSortBy('productoAsc')}>Producto A-Z</Dropdown.Item>
            <Dropdown.Item onClick={() => setSortBy('productoDesc')}>Producto Z-A</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Ubicación</th>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Estado</th>
            <th>Fecha Modificación</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {currentInventarios.map((inventario) => (
            <tr key={inventario.inventario_id}>
              <td>{inventario.inventario_id}</td>
              <td>{ubicaciones.find(u => u.ubicacion_id === inventario.ubicacion_id)?.ubicacion_nombre || 'Sin Ubicación'}</td>
              <td>{productos.find(p => p.producto_id === inventario.producto_id)?.producto_nombre || 'Sin Producto'}</td>
              <td>{inventario.inventario_cantidad}</td>
              <td>{inventario.inventario_status === 'A' ? 'Activo' : 'Inactivo'}</td>
              <td>{formatDateTime(inventario.inventario_fecha_modificacion)}</td>
              <td>
                <Button variant="info" onClick={() => handleEdit(inventario)}>
                  <FontAwesomeIcon icon={faEdit} /> Editar
                </Button>{' '}
                <Button
                  variant={inventario.inventario_status === 'A' ? 'danger' : 'success'}
                  onClick={() => toggleInventario(inventario)}
                >
                  <FontAwesomeIcon icon={inventario.inventario_status === 'A' ? faToggleOff : faToggleOn} />
                  {' '}
                  {inventario.inventario_status === 'A' ? 'Desactivar' : 'Activar'}
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
              &raquo;
            </Button>
          </li>
        </ul>
      </nav>

      {/* Modal para agregar o editar inventario */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{editingInventario ? 'Editar Inventario' : 'Agregar Inventario'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <InventarioForm
            inventario={editingInventario}
            onClose={handleCloseModal}
            refreshInventarios={fetchInventarios}
            ubicaciones={ubicaciones}
            productos={productos}
          />
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default InventarioList;

