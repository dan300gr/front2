import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';

const UbicacionForm = ({ ubicacion, onClose, refreshUbicaciones }) => {
  const [formData, setFormData] = useState({
    ubicacion_id: ubicacion ? ubicacion.ubicacion_id : '',
    ubicacion_nombre: ubicacion ? ubicacion.ubicacion_nombre : '',
    edificio_id: ubicacion ? ubicacion.edificio_id : '',
    ubicacion_status: ubicacion ? ubicacion.ubicacion_status : 'A',
  });

  const [edificios, setEdificios] = useState([]);

  useEffect(() => {
    const fetchEdificios = async () => {
      try {
        const response = await axios.get('https://api2-uetw.onrender.com/api/edificios/'); // Cambia la URL según corresponda
        setEdificios(response.data.filter(edificio => edificio.edificio_status === 'A')); // Filtrar edificios activos
      } catch (error) {
        console.error('Error al obtener edificios:', error);
      }
    };

    fetchEdificios();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Validar si se está editando y se intenta desactivar
      if (ubicacion && formData.ubicacion_status === 'I') {
        const inventariosResponse = await axios.get('https://api2-uetw.onrender.com/api/inventarios/');
        const inventarios = inventariosResponse.data;
        const isUbicacionInInventarios = inventarios.some(inventario => inventario.ubicacion_id === ubicacion.ubicacion_id);

        if (isUbicacionInInventarios) {
          Swal.fire({
            icon: 'warning',
            title: 'Advertencia',
            text: 'No se puede desactivar la ubicación porque está asociada a inventarios.',
          });
          return;
        }
      }

      // Guardar o actualizar la ubicación
      if (ubicacion) {
        await axios.put(`https://api2-uetw.onrender.com/api/ubicaciones/${ubicacion.ubicacion_id}`, formData);
        Swal.fire({
          icon: 'success',
          title: 'Actualización Exitosa',
          text: 'Ubicación actualizada exitosamente.',
        });
      } else {
        await axios.post('https://api2-uetw.onrender.com/api/ubicaciones/', formData);
        Swal.fire({
          icon: 'success',
          title: 'Guardado Exitoso',
          text: 'Ubicación guardada exitosamente.',
        });
      }

      refreshUbicaciones();
      onClose();
    } catch (error) {
      console.error('Error al guardar la ubicación:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al guardar la ubicación.',
      });
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Label>ID de la Ubicación</Form.Label>
        <Form.Control
          type="text"
          name="ubicacion_id"
          value={formData.ubicacion_id}
          onChange={handleChange}
          placeholder="Ingrese el ID de la ubicación"
          required
          disabled={!!ubicacion} // Deshabilita el ID si se está editando
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Nombre de la Ubicación</Form.Label>
        <Form.Control
          type="text"
          name="ubicacion_nombre"
          value={formData.ubicacion_nombre}
          onChange={handleChange}
          placeholder="Ingrese el nombre de la ubicación"
          required
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Edificio</Form.Label>
        <Form.Control as="select" name="edificio_id" value={formData.edificio_id} onChange={handleChange} required>
          <option value="">Seleccione un edificio</option>
          {edificios.map(edificio => (
            <option key={edificio.edificio_id} value={edificio.edificio_id}>
              {edificio.edificio_nombre}
            </option>
          ))}
        </Form.Control>
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Estado</Form.Label>
        <Form.Control as="select" name="ubicacion_status" value={formData.ubicacion_status} onChange={handleChange}>
          <option value="A">Activo</option>
          <option value="I">Inactivo</option>
        </Form.Control>
      </Form.Group>
      <Button variant="success" type="submit">
        <FontAwesomeIcon icon={faSave} /> {ubicacion ? 'Actualizar' : 'Guardar'}
      </Button>
      <Button variant="secondary" className="ms-2" onClick={onClose}>
        <FontAwesomeIcon icon={faArrowLeft} /> Volver
      </Button>
    </Form>
  );
};

export default UbicacionForm;
