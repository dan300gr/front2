import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Table, Modal, Form, Dropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faPlus, faSearch, faFilter } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import CatalogForm from './CatalogForm';

const CatalogList = () => {
  const [catalogos, setCatalogos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCatalogo, setEditingCatalogo] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [sortBy, setSortBy] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchCatalogos();
  }, []);

  const fetchCatalogos = async () => {
    try {
      const response = await axios.get('http://20.246.139.92/api/catalogos/');
      setCatalogos(response.data);
    } catch (error) {
      console.error('Error al obtener los catálogos:', error);
    }
  };

  const handleEdit = (catalogo) => {
    setEditingCatalogo(catalogo);
    setShowModal(true);
  };

  const handleShowModal = () => {
    setEditingCatalogo(null);
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleDelete = async (catalogo_id) => {
    try {
      // Comprobar si el catálogo está asociado a algún producto
      const productsResponse = await axios.get('http://20.246.139.92/api/productos/');
      const products = productsResponse.data;
      const isCatalogInProducts = products.some(product => product.catalogo_id === catalogo_id);
      
      if (isCatalogInProducts) {
        Swal.fire({
          icon: 'warning',
          title: 'Advertencia',
          text: 'No se puede eliminar el catálogo porque está asociado a productos.',
        });
        return;
      }

      await axios.delete(`http://20.246.139.92/api/catalogos/${catalogo_id}`);
      Swal.fire({
        icon: 'success',
        title: 'Catálogo eliminado',
        text: 'El catálogo ha sido eliminado exitosamente.',
      });
      fetchCatalogos();
    } catch (error) {
      console.error('Error al eliminar el catálogo:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar el catálogo.',
      });
    }
  };

  const filteredCatalogos = catalogos.filter((catalogo) => {
    const nameMatch = catalogo.catalogo_nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = filterStatus === 'todos' || catalogo.catalogo_status === filterStatus;
    return nameMatch && statusMatch;
  });

  const sortedCatalogos = [...filteredCatalogos].sort((a, b) => {
    if (sortBy === 'nombreAsc') {
      return a.catalogo_nombre.localeCompare(b.catalogo_nombre);
    } else if (sortBy === 'nombreDesc') {
      return b.catalogo_nombre.localeCompare(a.catalogo_nombre);
    }
    return 0;
  });

  const indexOfLastCatalogo = currentPage * itemsPerPage;
  const indexOfFirstCatalogo = indexOfLastCatalogo - itemsPerPage;
  const currentCatalogos = sortedCatalogos.slice(indexOfFirstCatalogo, indexOfLastCatalogo);
  const totalPages = Math.ceil(sortedCatalogos.length / itemsPerPage);

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center my-4">
        <h1>Lista de Catálogos</h1>
        <Button variant="success" onClick={handleShowModal}>
          <FontAwesomeIcon icon={faPlus} /> Agregar Catálogo
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
            <Dropdown.Item onClick={() => setSortBy('nombreAsc')}>Catálogo A-Z</Dropdown.Item>
            <Dropdown.Item onClick={() => setSortBy('nombreDesc')}>Catálogo Z-A</Dropdown.Item>
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
          {currentCatalogos.map((catalogo) => (
            <tr key={catalogo.catalogo_id}>
              <td>{catalogo.catalogo_id}</td>
              <td>{catalogo.catalogo_nombre}</td>
              <td>{catalogo.catalogo_status === 'A' ? 'Activo' : 'Inactivo'}</td>
              <td>
                <Button variant="info" onClick={() => handleEdit(catalogo)}>
                  <FontAwesomeIcon icon={faEdit} /> Editar
                </Button>{' '}
                <Button
                  variant="danger"
                  onClick={() => handleDelete(catalogo.catalogo_id)}
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
          <Modal.Title>{editingCatalogo ? 'Editar Catálogo' : 'Agregar Catálogo'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <CatalogForm catalogo={editingCatalogo} onClose={handleCloseModal} refreshCatalogos={fetchCatalogos} />
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default CatalogList;

