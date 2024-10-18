import React, { useState } from 'react';
import axios from 'axios';
import { Form, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';

const EdificioForm = ({ edificio, onClose, refreshEdificios }) => {
  const [formData, setFormData] = useState({
    edificio_id: edificio ? edificio.edificio_id : '',
    edificio_nombre: edificio ? edificio.edificio_nombre : '',
    edificio_direccion: edificio ? edificio.edificio_direccion : '',
    edificio_status: edificio ? edificio.edificio_status : 'A',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Si estamos editando un edificio y se intenta desactivar, comprobamos si está asociado a alguna ubicación
      if (edificio && formData.edificio_status === 'I') {
        const ubicacionesResponse = await axios.get('https://20.246.139.92/api/ubicaciones/');
        const ubicaciones = ubicacionesResponse.data;
        const isEdificioInUbicaciones = ubicaciones.some(ubicacion => ubicacion.edificio_id === edificio.edificio_id);

        if (isEdificioInUbicaciones) {
          Swal.fire({
            icon: 'warning',
            title: 'Advertencia',
            text: 'No se puede desactivar el edificio porque está asociado a ubicaciones.',
          });
          return;
        }
      }

      // Guardar o actualizar el edificio
      if (edificio) {
        await axios.put(`https://20.246.139.92/api/edificios/${edificio.edificio_id}`, formData);
        Swal.fire({
          icon: 'success',
          title: 'Actualización Exitosa',
          text: 'Edificio actualizado exitosamente.',
        });
      } else {
        await axios.post('https://20.246.139.92/api/edificios/', formData);
        Swal.fire({
          icon: 'success',
          title: 'Guardado Exitoso',
          text: 'Edificio guardado exitosamente.',
        });
      }

      refreshEdificios();
      onClose();
    } catch (error) {
      console.error('Error al guardar el edificio:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al guardar el edificio.',
      });
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Label>ID del Edificio</Form.Label>
        <Form.Control
          type="text"
          name="edificio_id"
          value={formData.edificio_id}
          onChange={handleChange}
          placeholder="Ingrese el ID del edificio"
          required
          disabled={!!edificio} // Deshabilita el ID si se está editando
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Nombre del Edificio</Form.Label>
        <Form.Control
          type="text"
          name="edificio_nombre"
          value={formData.edificio_nombre}
          onChange={handleChange}
          placeholder="Ingrese el nombre del edificio"
          required
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Dirección</Form.Label>
        <Form.Control
          type="text"
          name="edificio_direccion"
          value={formData.edificio_direccion}
          onChange={handleChange}
          placeholder="Ingrese la dirección del edificio"
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Estado</Form.Label>
        <Form.Control as="select" name="edificio_status" value={formData.edificio_status} onChange={handleChange}>
          <option value="A">Activo</option>
          <option value="I">Inactivo</option>
        </Form.Control>
      </Form.Group>
      <Button variant="success" type="submit">
        <FontAwesomeIcon icon={faSave} /> {edificio ? 'Actualizar' : 'Guardar'}
      </Button>
      <Button variant="secondary" className="ms-2" onClick={onClose}>
        <FontAwesomeIcon icon={faArrowLeft} /> Volver
      </Button>
    </Form>
  );
};

export default EdificioForm;
