import React, { useState } from 'react';
import axios from 'axios';
import { Form, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';

const AlbumForm = ({ album, onClose, refreshAlbums, artistas }) => {
  const [formData, setFormData] = useState({
    album_id: album ? album.album_id : '',
    album_nombre: album ? album.album_nombre : '',
    artista_id: album ? album.artista_id : '',
    album_status: album ? album.album_status : 'A',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Si se intenta cambiar el estado a inactivo
      if (album && formData.album_status === 'I') {
        const productsResponse = await axios.get('http://20.246.139.92/api/productos/');
        const products = productsResponse.data;
        const isAlbumInProducts = products.some(product => product.album_id === album.album_id);

        if (isAlbumInProducts) {
          Swal.fire('Error', 'No se puede desactivar este álbum porque está siendo utilizado en productos.', 'error');
          return;
        }
      }

      if (album) {
        await axios.put(`http://20.246.139.92/api/albumes/${formData.album_id}`, formData);
        Swal.fire('Actualizado!', 'El álbum ha sido actualizado.', 'success');
      } else {
        await axios.post('http://20.246.139.92/api/albumes/', formData);
        Swal.fire('Guardado!', 'El álbum ha sido guardado.', 'success');
      }
      refreshAlbums();
      onClose();
    } catch (error) {
      console.error('Error al guardar el álbum:', error);
      Swal.fire('Cuidado', 'Ya existe un álbum con ese ID.', 'warning');
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3" controlId="formAlbumId">
        <Form.Label>ID del Álbum</Form.Label>
        <Form.Control
          type="text"
          name="album_id"
          value={formData.album_id}
          onChange={handleChange}
          placeholder="Ingrese el ID del álbum"
          required
          disabled={!!album} // Deshabilita si se está editando
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="formAlbumNombre">
        <Form.Label>Nombre del Álbum</Form.Label>
        <Form.Control
          type="text"
          name="album_nombre"
          value={formData.album_nombre}
          onChange={handleChange}
          placeholder="Ingrese el nombre del álbum"
          required
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="formArtista">
        <Form.Label>Artista</Form.Label>
        <Form.Control
          as="select"
          name="artista_id"
          value={formData.artista_id}
          onChange={handleChange}
          required
        >
          <option value="">Seleccione un artista</option>
          {artistas.filter(artista => artista.artista_status === 'A').map((artista) => (
            <option key={artista.artista_id} value={artista.artista_id}>
              {artista.artista_nombre}
            </option>
          ))}
        </Form.Control>
      </Form.Group>

      <Form.Group className="mb-3" controlId="formAlbumStatus">
        <Form.Label>Estado</Form.Label>
        <Form.Control
          as="select"
          name="album_status"
          value={formData.album_status}
          onChange={handleChange}
        >
          <option value="A">Activo</option>
          <option value="I">Inactivo</option>
        </Form.Control>
      </Form.Group>

      <div className="d-flex justify-content-between">
        <Button variant="secondary" onClick={onClose}>
          <FontAwesomeIcon icon={faArrowLeft} /> Volver
        </Button>
        <Button variant="success" type="submit">
          <FontAwesomeIcon icon={faSave} /> {album ? 'Actualizar' : 'Guardar'}
        </Button>
      </div>
    </Form>
  );
};

export default AlbumForm;
