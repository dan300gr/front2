import React, { useState } from 'react';
import axios from 'axios';
import { Form, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';

const ArtistForm = ({ artist, onClose, refreshArtists }) => {
  const [formData, setFormData] = useState({
    artista_id: artist ? artist.artista_id : '',
    artista_nombre: artist ? artist.artista_nombre : '',
    artista_status: artist ? artist.artista_status : 'A',
  });

  const [idExists, setIdExists] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación de ID existente
    try {
      const response = await axios.get('https://20.246.139.92/api/artistas/');
      const existingArtists = response.data;

      // Verificar si el ID ya existe en la base de datos
      const idExists = existingArtists.some(
        (artist) => artist.artista_id === formData.artista_id && artist.artista_id !== formData.artista_id
      );

      if (idExists) {
        Swal.fire({
          icon: 'warning',
          title: 'Advertencia',
          text: 'Ya existe un artista con ese ID.',
        });
        return;
      }

      // Si estamos editando un artista y se intenta desactivar, comprobamos si está asociado a un álbum
      if (artist && formData.artista_status === 'I') {
        const albumsResponse = await axios.get('https://20.246.139.92/api/albumes/');
        const albums = albumsResponse.data;
        const isArtistInAlbums = albums.some(album => album.artista_id === artist.artista_id);

        if (isArtistInAlbums) {
          Swal.fire({
            icon: 'warning',
            title: 'Advertencia',
            text: 'No se puede desactivar a un artista que está asociado a un álbum.',
          });
          return;
        }
      }

      if (artist) {
        await axios.put(`https://20.246.139.92/api/artistas/${artist.artista_id}`, formData);
        Swal.fire({
          icon: 'success',
          title: 'Actualización Exitosa',
          text: 'Artista actualizado exitosamente.',
        });
      } else {
        await axios.post('https://20.246.139.92/api/artistas/', formData);
        Swal.fire({
          icon: 'success',
          title: 'Guardado Exitoso',
          text: 'Artista guardado exitosamente.',
        });
      }
      refreshArtists();
      onClose();
    } catch (error) {
      console.error('Error al guardar el artista:', error);
      Swal.fire({
        icon: 'warning',
        title: 'Error',
        text: 'Ya existe un artista con ese ID.',
      });
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Label>ID del Artista</Form.Label>
        <Form.Control
          type="text"
          name="artista_id"
          value={formData.artista_id}
          onChange={handleChange}
          placeholder="Ingrese el ID del artista"
          required
          disabled={!!artist} // Disable ID input when editing
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Nombre del Artista</Form.Label>
        <Form.Control
          type="text"
          name="artista_nombre"
          value={formData.artista_nombre}
          onChange={handleChange}
          placeholder="Ingrese el nombre del artista"
          required
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Estado</Form.Label>
        <Form.Control as="select" name="artista_status" value={formData.artista_status} onChange={handleChange}>
          <option value="A">Activo</option>
          <option value="I">Inactivo</option>
        </Form.Control>
      </Form.Group>
      <Button variant="success" type="submit">
        <FontAwesomeIcon icon={faSave} /> {artist ? 'Actualizar' : 'Guardar'}
      </Button>
      <Button variant="secondary" className="ms-2" onClick={onClose}>
        <FontAwesomeIcon icon={faArrowLeft} /> Volver
      </Button>
    </Form>
  );
};

export default ArtistForm;
