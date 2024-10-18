import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Table, Modal, Form, Dropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faToggleOn, faToggleOff, faPlus, faSearch, faFilter } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import ProductForm from './ProductForm';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [sortBy, setSortBy] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [types, setTypes] = useState([]);
  const [catalogs, setCatalogs] = useState([]);
  const [albums, setAlbums] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchTypes();
    fetchCatalogs();
    fetchAlbums();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('https://20.246.139.92/api/productos/');
      setProducts(response.data);
    } catch (error) {
      console.error('Error al obtener los productos:', error);
    }
  };

  const fetchTypes = async () => {
    try {
      const response = await axios.get('https://20.246.139.92/api/tipos-producto/');
      setTypes(response.data);
    } catch (error) {
      console.error('Error al obtener los tipos de productos:', error);
    }
  };

  const fetchCatalogs = async () => {
    try {
      const response = await axios.get('https://20.246.139.92/api/catalogos/');
      setCatalogs(response.data);
    } catch (error) {
      console.error('Error al obtener los catálogos:', error);
    }
  };

  const fetchAlbums = async () => {
    try {
      const response = await axios.get('https://20.246.139.92/api/albumes/');
      setAlbums(response.data);
    } catch (error) {
      console.error('Error al obtener los álbumes:', error);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleShowModal = () => {
    setEditingProduct(null);
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleDelete = async (producto_id) => {
    try {
      // Comprobar si el producto está asociado a algún stock
      const stockResponse = await axios.get('https://20.246.139.92/api/stocks/');
      const stocks = stockResponse.data;
      const isProductInStock = stocks.some(stock => stock.producto_id === producto_id);
  
      if (isProductInStock) {
        Swal.fire({
          icon: 'warning',
          title: 'Advertencia',
          text: 'No se puede eliminar el producto porque está asociado a un stock.',
        });
        return;
      }
  
      // Si no está en stock, proceder a eliminar el producto
      await axios.delete(`https://20.246.139.92/api/productos/${producto_id}`);
      Swal.fire('Eliminado!', 'El producto ha sido eliminado.', 'success');
      fetchProducts();
    } catch (error) {
      console.error('Error al eliminar el producto:', error);
      Swal.fire('Error', 'No se pudo eliminar el producto.', 'error');
    }
  };

  const filteredProducts = products.filter((product) =>
    product.producto_nombre.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterStatus === 'todos' || product.producto_status === filterStatus)
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'productAsc') {
      return a.producto_nombre.localeCompare(b.producto_nombre);
    } else if (sortBy === 'productDesc') {
      return b.producto_nombre.localeCompare(a.producto_nombre);
    }
    return 0;
  });

  const indexOfLastProduct = currentPage * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
  const currentProducts = sortedProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);

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
            <Dropdown.Item onClick={() => setSortBy('productAsc')}>Producto A-Z</Dropdown.Item>
            <Dropdown.Item onClick={() => setSortBy('productDesc')}>Producto Z-A</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Tipo</th>
            <th>Catálogo</th>
            <th>Álbum</th>
            <th>Precio</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {currentProducts.map((product) => (
            <tr key={product.producto_id}>
              <td>{product.producto_id}</td>
              <td>{product.producto_nombre}</td>
              <td>{types.find(type => type.tipo_id === product.tipo_id)?.tipo_nombre || 'Desconocido'}</td>
              <td>{catalogs.find(catalog => catalog.catalogo_id === product.catalogo_id)?.catalogo_nombre || 'Desconocido'}</td>
              <td>{albums.find(album => album.album_id === product.album_id)?.album_nombre || 'Desconocido'}</td>
              <td>${product.producto_precio}</td>
              <td>{product.producto_status === 'A' ? 'Activo' : 'Inactivo'}</td>
              <td>
                <Button variant="info" onClick={() => handleEdit(product)}>
                  <FontAwesomeIcon icon={faEdit} /> Editar
                </Button>{' '}
                <Button variant="danger" onClick={() => handleDelete(product.producto_id)}>
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
          <Modal.Title>{editingProduct ? 'Editar Producto' : 'Agregar Producto'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ProductForm product={editingProduct} onClose={handleCloseModal} refreshProducts={fetchProducts} types={types} catalogs={catalogs} albums={albums} />
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ProductList;
