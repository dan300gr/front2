import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';

const ProveedorForm = ({ proveedor, onClose, refreshProveedores }) => {
  const [formData, setFormData] = useState({
    proveedor_id: proveedor ? proveedor.proveedor_id : '',
    proveedor_nombre: proveedor ? proveedor.proveedor_nombre : '',
    proveedor_direccion: proveedor ? proveedor.proveedor_direccion : '',
    proveedor_telefono: proveedor ? proveedor.proveedor_telefono : '',
    proveedor_correo: proveedor ? proveedor.proveedor_correo : '',
    proveedor_status: proveedor ? proveedor.proveedor_status : 'A',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.get('http://20.246.139.92/api/proveedores/');
      const existingProveedores = response.data;

      // Verificar si el ID ya existe en la base de datos
      const idExists = existingProveedores.some(
        (prov) => prov.proveedor_id === formData.proveedor_id && prov.proveedor_id !== (proveedor ? proveedor.proveedor_id : null)
      );

      if (idExists) {
        Swal.fire({
          icon: 'warning',
          title: 'Advertencia',
          text: 'Ya existe un proveedor con ese ID.',
        });
        return;
      }

      if (proveedor) {
        await axios.put(`http://20.246.139.92/api/proveedores/${proveedor.proveedor_id}`, formData);
        Swal.fire({
          icon: 'success',
          title: 'Actualización Exitosa',
          text: 'Proveedor actualizado exitosamente.',
        });
      } else {
        await axios.post('http://20.246.139.92/api/proveedores/', formData);
        Swal.fire({
          icon: 'success',
          title: 'Guardado Exitoso',
          text: 'Proveedor guardado exitosamente.',
        });
      }

      refreshProveedores();
      onClose();
    } catch (error) {
      console.error('Error al guardar el proveedor:', error);
      Swal.fire({
        icon: 'warning',
        title: 'Error',
        text: 'Ya existe un proveedor con ese ID.',
      });
    }
  };

  useEffect(() => {
    if (proveedor) {
      setFormData({
        proveedor_id: proveedor.proveedor_id,
        proveedor_nombre: proveedor.proveedor_nombre,
        proveedor_direccion: proveedor.proveedor_direccion,
        proveedor_telefono: proveedor.proveedor_telefono,
        proveedor_correo: proveedor.proveedor_correo,
        proveedor_status: proveedor.proveedor_status,
      });
    }
  }, [proveedor]);

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Label>ID del Proveedor</Form.Label>
        <Form.Control
          type="text"
          name="proveedor_id"
          value={formData.proveedor_id}
          onChange={handleChange}
          placeholder="Ingrese el ID del proveedor"
          required
          disabled={!!proveedor} // Disable ID input when editing
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Nombre del Proveedor</Form.Label>
        <Form.Control
          type="text"
          name="proveedor_nombre"
          value={formData.proveedor_nombre}
          onChange={handleChange}
          placeholder="Ingrese el nombre del proveedor"
          required
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Dirección</Form.Label>
        <Form.Control
          type="text"
          name="proveedor_direccion"
          value={formData.proveedor_direccion}
          onChange={handleChange}
          placeholder="Ingrese la dirección del proveedor"
          required
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Teléfono</Form.Label>
        <Form.Control
          type="text"
          name="proveedor_telefono"
          value={formData.proveedor_telefono}
          onChange={handleChange}
          placeholder="Ingrese el teléfono del proveedor"
          required
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Correo</Form.Label>
        <Form.Control
          type="email"
          name="proveedor_correo"
          value={formData.proveedor_correo}
          onChange={handleChange}
          placeholder="Ingrese el correo del proveedor"
          required
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Estado</Form.Label>
        <Form.Control as="select" name="proveedor_status" value={formData.proveedor_status} onChange={handleChange}>
          <option value="A">Activo</option>
          <option value="I">Inactivo</option>
        </Form.Control>
      </Form.Group>
      <Button variant="success" type="submit">
        <FontAwesomeIcon icon={faSave} /> {proveedor ? 'Actualizar' : 'Guardar'}
      </Button>
      <Button variant="secondary" className="ms-2" onClick={onClose}>
        <FontAwesomeIcon icon={faArrowLeft} /> Volver
      </Button>
    </Form>
  );
};

export default ProveedorForm;
