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

  const [estados, setEstados] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [selectedEstado, setSelectedEstado] = useState('');
  const [selectedCiudad, setSelectedCiudad] = useState('');

  useEffect(() => {
    fetchEstados();
  }, []);

  useEffect(() => {
    if (selectedEstado) {
      const estadoSeleccionado = estados.find(estado => estado.estado_id === parseInt(selectedEstado));
      if (estadoSeleccionado) {
        setCiudades([{ ciudad_descripcion: estadoSeleccionado.ciudad_descripcion }]);
      }
    }
  }, [selectedEstado, estados]);

  const fetchEstados = async () => {
    try {
      const response = await axios.get('https://34.134.65.19:5001/estados/api/estados');
      setEstados(response.data);
    } catch (error) {
      console.error('Error al obtener los estados:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEstadoChange = (e) => {
    setSelectedEstado(e.target.value);
    setSelectedCiudad('');
  };

  const handleCiudadChange = (e) => {
    setSelectedCiudad(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (proveedor) {
        await axios.put(`https://api2-uetw.onrender.com/api/proveedores/${proveedor.proveedor_id}`, formData);
        Swal.fire({
          icon: 'success',
          title: 'Actualización Exitosa',
          text: 'Proveedor actualizado exitosamente.',
        });
      } else {
        await axios.post('https://api2-uetw.onrender.com/api/proveedores/', formData);
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
        text: 'No se puede guardar un proveedor con el mismo ID.',
      });
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Label>ID del Proveedor</Form.Label>
        <Form.Control
          type="number"
          name="proveedor_id"
          value={formData.proveedor_id}
          onChange={handleChange}
          placeholder="Ingrese el ID del proveedor"
          required
          disabled={!!proveedor}
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
        <Form.Label>Estado</Form.Label>
        <Form.Control 
          as="select" 
          value={selectedEstado} 
          onChange={handleEstadoChange}
        >
          <option value="">Seleccione un estado</option>
          {estados.map((estado) => (
            <option key={estado.estado_id} value={estado.estado_id}>
              {estado.estado_descripcion}
            </option>
          ))}
        </Form.Control>
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Ciudad</Form.Label>
        <Form.Control 
          as="select" 
          value={selectedCiudad} 
          onChange={handleCiudadChange}
          disabled={!selectedEstado}
        >
          <option value="">Seleccione una ciudad</option>
          {ciudades.map((ciudad, index) => (
            <option key={index} value={ciudad.ciudad_descripcion}>
              {ciudad.ciudad_descripcion}
            </option>
          ))}
        </Form.Control>
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Dirección</Form.Label>
        <Form.Control
          type="text"
          name="proveedor_direccion"
          value={formData.proveedor_direccion}
          onChange={handleChange}
          placeholder="Ingrese la dirección del proveedor"
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

