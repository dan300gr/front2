import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Table, Modal, Form, Dropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faToggleOn, faToggleOff, faPlus, faSearch, faFilter } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import ProductForm from './ProductForm'; // El formulario se muestra en el modal

const ProductList = () => {
  const [productos, setProductos] = useState([]);
  const [catalogos, setCatalogos] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [tiposProductos, setTiposProductos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProducto, setEditingProducto] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [sortBy, setSortBy] = useState(''); // Estado para el ordenamiento
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchProductos();
    fetchCatalogos();
    fetchAlbums();
    fetchTiposProductos();
  }, []);

  const fetchProductos = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/productos/');
      setProductos(response.data);
    } catch (error) {
      console.error('Error al obtener los productos:', error);
    }
  };

  const fetchCatalogos = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/catalogos/');
      setCatalogos(response.data);
    } catch (error) {
      console.error('Error al obtener los catálogos:', error);
    }
  };

  const fetchAlbums = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/albums/');
      setAlbums(response.data);
    } catch (error) {
      console.error('Error al obtener los álbumes:', error);
    }
  };

  const fetchTiposProductos = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/tipoproductos/');
      setTiposProductos(response.data);
    } catch (error) {
      console.error('Error al obtener los tipos de productos:', error);
    }
  };

  const getCatalogoNombre = (catalogo_id) => {
    const catalogo = catalogos.find(cat => cat.catalogo_id === catalogo_id);
    return catalogo ? catalogo.catalogo_nombre : 'Sin catálogo';
  };

  const getAlbumNombre = (album_id) => {
    const album = albums.find(alb => alb.album_id === album_id);
    return album ? album.album_nombre : 'Sin álbum';
  };

  const getTipoProductoNombre = (tipo_id) => {
    const tipo = tiposProductos.find(tp => tp.tipo_id === tipo_id);
    return tipo ? tipo.tipo_nombre : 'Sin tipo';
  };

  const formatDateTime = (datetime) => {
    const date = new Date(datetime);
    return date.toLocaleString();  // Formatear a cadena legible
  };

  const toggleProducto = async (producto) => {
    try {
      if (producto.producto_status === 'A') {
        const response = await axios.put(`http://127.0.0.1:8000/productos/${producto.producto_id}/desactivar`);
        Swal.fire({
          icon: 'success',
          title: 'Producto desactivado',
          text: 'El producto ha sido desactivado exitosamente.',
        });
      } else {
        await axios.put(`http://127.0.0.1:8000/productos/${producto.producto_id}/activar`);
        Swal.fire({
          icon: 'success',
          title: 'Producto activado',
          text: 'El producto ha sido activado exitosamente.',
        });
      }
      fetchProductos();
    } catch (error) {
      console.error('Error al cambiar el estado del producto:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cambiar el estado del producto.',
      });
    }
  };

  const handleEdit = (producto) => {
    setEditingProducto(producto);
    setShowModal(true);
  };

  const handleShowModal = () => {
    setEditingProducto(null);
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  // Filtrar productos según el término de búsqueda y el estado
  const filteredProductos = productos.filter(producto =>
    producto.producto_nombre.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterStatus === 'todos' || producto.producto_status === filterStatus)
  );

  // Ordenar productos
  const sortedProductos = [...filteredProductos].sort((a, b) => {
    if (sortBy === 'productoAsc') {
      return a.producto_nombre.localeCompare(b.producto_nombre);
    } else if (sortBy === 'productoDesc') {
      return b.producto_nombre.localeCompare(a.producto_nombre);
    } else if (sortBy === 'tipoAsc') {
      return getTipoProductoNombre(a.tipo_id).localeCompare(getTipoProductoNombre(b.tipo_id));
    } else if (sortBy === 'tipoDesc') {
      return getTipoProductoNombre(b.tipo_id).localeCompare(getTipoProductoNombre(a.tipo_id));
    } else if (sortBy === 'catalogoAsc') {
      return getCatalogoNombre(a.catalogo_id).localeCompare(getCatalogoNombre(b.catalogo_id));
    } else if (sortBy === 'catalogoDesc') {
      return getCatalogoNombre(b.catalogo_id).localeCompare(getCatalogoNombre(a.catalogo_id));
    } else if (sortBy === 'albumAsc') {
      return getAlbumNombre(a.album_id).localeCompare(getAlbumNombre(b.album_id));
    } else if (sortBy === 'albumDesc') {
      return getAlbumNombre(b.album_id).localeCompare(getAlbumNombre(a.album_id));
    }
    return 0; // Mantener el orden si no hay sortBy seleccionado
  });

  // Paginación
  const indexOfLastProducto = currentPage * itemsPerPage;
  const indexOfFirstProducto = indexOfLastProducto - itemsPerPage;
  const currentProductos = sortedProductos.slice(indexOfFirstProducto, indexOfLastProducto);
  const totalPages = Math.ceil(sortedProductos.length / itemsPerPage);

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center my-4">
        <h1>Lista de Productos</h1>
        <Button variant="success" onClick={handleShowModal}>
          <FontAwesomeIcon icon={faPlus} /> Agregar Producto
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
            placeholder="Buscar producto"
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
            <Dropdown.Item onClick={() => setSortBy('productoAsc')}>Producto A-Z</Dropdown.Item>
            <Dropdown.Item onClick={() => setSortBy('productoDesc')}>Producto Z-A</Dropdown.Item>
            <Dropdown.Item onClick={() => setSortBy('tipoAsc')}>Tipo de Producto A-Z</Dropdown.Item>
            <Dropdown.Item onClick={() => setSortBy('tipoDesc')}>Tipo de Producto Z-A</Dropdown.Item>
            <Dropdown.Item onClick={() => setSortBy('catalogoAsc')}>Catálogo A-Z</Dropdown.Item>
            <Dropdown.Item onClick={() => setSortBy('catalogoDesc')}>Catálogo Z-A</Dropdown.Item>
            <Dropdown.Item onClick={() => setSortBy('albumAsc')}>Álbum A-Z</Dropdown.Item>
            <Dropdown.Item onClick={() => setSortBy('albumDesc')}>Álbum Z-A</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Precio</th>
            <th>Tipo de Producto</th>
            <th>Catálogo</th>
            <th>Álbum</th>
            <th>Estado</th>
            <th>Fecha Modificación</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {currentProductos.map((producto) => (
            <tr key={producto.producto_id}>
              <td>{producto.producto_id}</td>
              <td>{producto.producto_nombre}</td>
              <td>${producto.producto_precio}</td> {/* Mostrar signo de pesos */}
              <td>{getTipoProductoNombre(producto.tipo_id)}</td>
              <td>{getCatalogoNombre(producto.catalogo_id)}</td>
              <td>{getAlbumNombre(producto.album_id)}</td>
              <td>{producto.producto_status === 'A' ? 'Activo' : 'Inactivo'}</td>
              <td>{formatDateTime(producto.producto_fecha_modificacion)}</td> {/* Mostrar fecha y hora de modificación */}
              <td>
                <Button variant="info" onClick={() => handleEdit(producto)}>
                  <FontAwesomeIcon icon={faEdit} /> Editar
                </Button>{' '}
                <Button
                  variant={producto.producto_status === 'A' ? 'danger' : 'success'}
                  onClick={() => toggleProducto(producto)}
                >
                  <FontAwesomeIcon icon={producto.producto_status === 'A' ? faToggleOff : faToggleOn} />
                  {' '}
                  {producto.producto_status === 'A' ? 'Desactivar' : 'Activar'}
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
          <Modal.Title>{editingProducto ? 'Editar Producto' : 'Agregar Producto'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ProductForm
            producto={editingProducto}
            onClose={handleCloseModal}
            refreshProductos={fetchProductos}
            catalogos={catalogos}
            albums={albums}
            tiposProductos={tiposProductos}
          />
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ProductList;
