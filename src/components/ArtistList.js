import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Table, Modal, Form, Dropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faPlus, faSearch, faFilter } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import ArtistForm from './ArtistForm';

const ArtistList = () => {
  const [artists, setArtists] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingArtist, setEditingArtist] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [sortBy, setSortBy] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchArtists();
  }, []);

  const fetchArtists = async () => {
    try {
      const response = await axios.get('http://20.246.139.92/api/artistas/');
      setArtists(response.data);
    } catch (error) {
      console.error('Error al obtener los artistas:', error);
    }
  };

  const handleEdit = (artist) => {
    setEditingArtist(artist);
    setShowModal(true);
  };

  const handleShowModal = () => {
    setEditingArtist(null);
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleDelete = async (artista_id) => {
    try {
      // Comprobar si el artista está asociado a algún álbum
      const albumsResponse = await axios.get('http://20.246.139.92/api/albumes/');
      const albums = albumsResponse.data;
      const isArtistInAlbums = albums.some(album => album.artista_id === artista_id);
      
      if (isArtistInAlbums) {
        Swal.fire({
          icon: 'warning',
          title: 'Advertencia',
          text: 'No se puede eliminar a un artista que está asociado a un álbum.',
        });
        return;
      }

      await axios.delete(`http://20.246.139.92/api/artistas/${artista_id}`);
      Swal.fire({
        icon: 'success',
        title: 'Artista eliminado',
        text: 'El artista ha sido eliminado exitosamente.',
      });
      fetchArtists();
    } catch (error) {
      console.error('Error al eliminar el artista:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar el artista.',
      });
    }
  };

  const filteredArtists = artists.filter((artist) => {
    const nameMatch = artist.artista_nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = filterStatus === 'todos' || artist.artista_status === filterStatus;
    return nameMatch && statusMatch;
  });

  const sortedArtists = [...filteredArtists].sort((a, b) => {
    if (sortBy === 'nombreAsc') {
      return a.artista_nombre.localeCompare(b.artista_nombre);
    } else if (sortBy === 'nombreDesc') {
      return b.artista_nombre.localeCompare(a.artista_nombre);
    }
    return 0;
  });

  const indexOfLastArtist = currentPage * itemsPerPage;
  const indexOfFirstArtist = indexOfLastArtist - itemsPerPage;
  const currentArtists = sortedArtists.slice(indexOfFirstArtist, indexOfLastArtist);
  const totalPages = Math.ceil(sortedArtists.length / itemsPerPage);

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center my-4">
        <h1>Lista de Artistas</h1>
        <Button variant="success" onClick={handleShowModal}>
          <FontAwesomeIcon icon={faPlus} /> Agregar Artista
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
            <Dropdown.Item onClick={() => setSortBy('nombreAsc')}>Artista A-Z</Dropdown.Item>
            <Dropdown.Item onClick={() => setSortBy('nombreDesc')}>Artista Z-A</Dropdown.Item>
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
          {currentArtists.map((artist) => (
            <tr key={artist.artista_id}>
              <td>{artist.artista_id}</td>
              <td>{artist.artista_nombre}</td>
              <td>{artist.artista_status === 'A' ? 'Activo' : 'Inactivo'}</td>
              <td>
                <Button variant="info" onClick={() => handleEdit(artist)}>
                  <FontAwesomeIcon icon={faEdit} /> Editar
                </Button>{' '}
                <Button
                  variant="danger"
                  onClick={() => handleDelete(artist.artista_id)}
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
          <Modal.Title>{editingArtist ? 'Editar Artista' : 'Agregar Artista'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ArtistForm artist={editingArtist} onClose={handleCloseModal} refreshArtists={fetchArtists} />
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ArtistList;
