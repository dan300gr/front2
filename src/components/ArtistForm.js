import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2'; // Importar SweetAlert2

const ArtistForm = ({ artista, onClose, refreshArtistas }) => {
  const [formData, setFormData] = useState({
    artista_id: artista ? artista.artista_id : '', // ID del artista
    artista_nombre: artista ? artista.artista_nombre : '',
  });

  useEffect(() => {
    if (artista) {
      setFormData({
        artista_id: artista.artista_id,
        artista_nombre: artista.artista_nombre,
      });
    }
  }, [artista]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Verificar si el artista ID ya existe, excepto cuando se está editando el mismo artista
      if (!artista || (artista && formData.artista_id !== artista.artista_id)) {
        const response = await axios.get(`http://127.0.0.1:8000/artistas/${formData.artista_id}`);
        if (response.status === 200) {
          Swal.fire('Error', 'Ya existe un artista con el mismo ID.', 'error');
          return; // No proceder si el artista ya existe
        }
      }
    } catch (error) {
      // Si el artista no existe, el error es esperado. Continuar con la creación.
    }

    try {
      if (artista) {
        await axios.put(`http://127.0.0.1:8000/artistas/${artista.artista_id}`, formData);
        Swal.fire('Éxito', 'Artista actualizado exitosamente.', 'success');
      } else {
        await axios.post('http://127.0.0.1:8000/artistas/', formData);
        Swal.fire('Éxito', 'Artista guardado exitosamente.', 'success');
      }
      refreshArtistas(); // Refrescar la lista de artistas
      onClose(); // Cerrar el modal
    } catch (error) {
      console.error('Error al guardar el artista:', error);
      Swal.fire('Error', 'Error al guardar el artista.', 'error');
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
          disabled={!!artista} // Deshabilitar si está en modo edición
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
      <Button variant="success" type="submit">
        <FontAwesomeIcon icon={faSave} /> {artista ? 'Actualizar Artista' : 'Guardar Artista'}
      </Button>
      <Button variant="secondary" className="ms-2" onClick={onClose}>
        <FontAwesomeIcon icon={faArrowLeft} /> Volver
      </Button>
    </Form>
  );
};

export default ArtistForm;