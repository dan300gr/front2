import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faArrowLeft, faFingerprint, faCompactDisc, faUser } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2'; // Importar SweetAlert2

const AlbumForm = ({ album, onClose, refreshAlbums }) => {
  const [formData, setFormData] = useState({
    album_id: album ? album.album_id : '',  // ID del álbum
    album_nombre: album ? album.album_nombre : '',
    artista_id: album ? album.artista_id : '',  // Relación con el artista
  });
  const [artistas, setArtistas] = useState([]);

  useEffect(() => {
    const fetchArtistas = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/artistas/');
        // Filtrar artistas activos
        const artistasActivos = response.data.filter(artista => artista.artista_status === 'A');
        setArtistas(artistasActivos);
      } catch (error) {
        console.error("Error al obtener los artistas:", error);
      }
    };

    fetchArtistas();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Verificar si el álbum ID ya existe, excepto cuando se está editando el mismo álbum
      if (!album || (album && formData.album_id !== album.album_id)) {
        const response = await axios.get(`http://127.0.0.1:8000/albums/${formData.album_id}`);
        if (response.status === 200) {
          Swal.fire({
            icon: 'warning',
            title: 'ID Duplicado',
            text: "Ya existe un álbum con el mismo ID.",
          });
          return; // No proceder si el álbum ya existe
        }
      }
    } catch (error) {
      // Si el álbum no existe, el error es esperado. Continuar con la creación.
    }

    try {
      if (album) {
        await axios.put(`http://127.0.0.1:8000/albums/${album.album_id}`, formData);
        Swal.fire({
          icon: 'success',
          title: 'Actualización Exitosa',
          text: "Álbum actualizado exitosamente.",
        });
      } else {
        await axios.post('http://127.0.0.1:8000/albums/', formData);
        Swal.fire({
          icon: 'success',
          title: 'Guardado Exitoso',
          text: "Álbum guardado exitosamente.",
        });
      }
      refreshAlbums(); // Refrescar la lista de álbumes
      onClose(); // Cerrar el modal
    } catch (error) {
      console.error("Error al guardar el álbum:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: "Error al guardar el álbum.",
      });
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Label><FontAwesomeIcon icon={faFingerprint}/> ID del Álbum</Form.Label>
        <Form.Control
          type="text"
          name="album_id"
          value={formData.album_id}
          onChange={handleChange}
          placeholder="Ingrese el ID del álbum"
          required
          disabled={!!album}  // Deshabilitar si está en modo edición
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label><FontAwesomeIcon icon={faCompactDisc}/> Nombre del Álbum</Form.Label>
        <Form.Control
          type="text"
          name="album_nombre"
          value={formData.album_nombre}
          onChange={handleChange}
          placeholder="Ingrese el nombre del álbum"
          required
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label><FontAwesomeIcon icon={faUser}/> Artista</Form.Label>
        <Form.Control
          as="select"
          name="artista_id"
          value={formData.artista_id}
          onChange={handleChange}
          required
        >
          <option value="">Seleccione un artista</option>
          {artistas.map(artista => (
            <option key={artista.artista_id} value={artista.artista_id}>
              {artista.artista_nombre}
            </option>
          ))}
        </Form.Control>
      </Form.Group>
      <Button variant="success" type="submit">
        <FontAwesomeIcon icon={faSave} /> {album ? 'Actualizar Álbum' : 'Guardar Álbum'}
      </Button>
      <Button variant="secondary" className="ms-2" onClick={onClose}>
        <FontAwesomeIcon icon={faArrowLeft} /> Volver
      </Button>
    </Form>
  );
};

export default AlbumForm;



