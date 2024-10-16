import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faDollarSign, faList, faCompactDisc, faMusic, faFingerprint } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2'; // Importar SweetAlert2

const ProductForm = ({ producto, onClose, refreshProductos, catalogos, albums, tiposProductos }) => {
  const [formData, setFormData] = useState({
    producto_id: producto ? producto.producto_id : '',
    producto_nombre: producto ? producto.producto_nombre : '',
    producto_precio: producto ? producto.producto_precio : '', // Cambiado a cadena vacía
    catalogo_id: producto ? producto.catalogo_id : '',
    album_id: producto ? producto.album_id : '',
    tipo_id: producto ? producto.tipo_id : '',
  });

  useEffect(() => {
    if (producto) {
      setFormData({
        producto_id: producto.producto_id,
        producto_nombre: producto.producto_nombre,
        producto_precio: producto.producto_precio.toString(), // Convertir a cadena
        catalogo_id: producto.catalogo_id,
        album_id: producto.album_id,
        tipo_id: producto.tipo_id,
      });
    }
  }, [producto]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'producto_precio' && value < 0) return; // No permitir valores negativos
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validar que el ID no esté duplicado
      if (!producto || (producto && formData.producto_id !== producto.producto_id)) {
        const response = await axios.get(`http://127.0.0.1:8000/productos/${formData.producto_id}`);
        if (response.status === 200) {
          Swal.fire({
            icon: 'warning',
            title: 'ID Duplicado',
            text: "Ya existe un producto con el mismo ID.",
          });
          return; // No proceder si el producto ya existe
        }
      }
    } catch (error) {
      // Si el producto no existe, el error es esperado. Continuar con la creación.
    }

    try {
      if (producto) {
        await axios.put(`http://127.0.0.1:8000/productos/${producto.producto_id}`, formData);
        Swal.fire({
          icon: 'success',
          title: 'Actualización Exitosa',
          text: "Producto actualizado exitosamente.",
        });
      } else {
        await axios.post('http://127.0.0.1:8000/productos/', formData);
        Swal.fire({
          icon: 'success',
          title: 'Guardado Exitoso',
          text: "Producto guardado exitosamente.",
        });
      }
      refreshProductos();
      onClose();
    } catch (error) {
      console.error("Error al guardar el producto:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: "Error al guardar el producto.",
      });
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Label>
          <FontAwesomeIcon icon={faFingerprint} /> ID del Producto
        </Form.Label>
        <Form.Control
          type="text"
          name="producto_id"
          value={formData.producto_id}
          onChange={handleChange}
          placeholder="Ingrese el ID del producto"
          required
          disabled={!!producto}
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>
          <FontAwesomeIcon icon={faMusic} /> Nombre del Producto
        </Form.Label>
        <Form.Control
          type="text"
          name="producto_nombre"
          value={formData.producto_nombre}
          onChange={handleChange}
          placeholder="Ingrese el nombre del producto"
          required
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>
          <FontAwesomeIcon icon={faDollarSign} /> Precio
        </Form.Label>
        <Form.Control
          type="number"
          name="producto_precio"
          value={formData.producto_precio}
          onChange={handleChange}
          placeholder="Ingrese el precio del producto"
          required
          min="0" // No permitir menos de 0
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>
          <FontAwesomeIcon icon={faList} /> Catálogo
        </Form.Label>
        <Form.Control
          as="select"
          name="catalogo_id"
          value={formData.catalogo_id}
          onChange={handleChange}
          required
        >
          <option value="">Seleccione un catálogo</option>
          {catalogos
            .filter(catalogo => catalogo.catalogo_status === 'A')
            .map(catalogo => (
              <option key={catalogo.catalogo_id} value={catalogo.catalogo_id}>
                {catalogo.catalogo_nombre}
              </option>
          ))}
        </Form.Control>
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>
          <FontAwesomeIcon icon={faCompactDisc} /> Álbum
        </Form.Label>
        <Form.Control
          as="select"
          name="album_id"
          value={formData.album_id}
          onChange={handleChange}
          required
        >
          <option value="">Seleccione un álbum</option>
          {albums
            .filter(album => album.album_status === 'A')
            .map(album => (
              <option key={album.album_id} value={album.album_id}>
                {album.album_nombre}
              </option>
          ))}
        </Form.Control>
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>
          <FontAwesomeIcon icon={faList} /> Tipo de Producto
        </Form.Label>
        <Form.Control
          as="select"
          name="tipo_id"
          value={formData.tipo_id}
          onChange={handleChange}
          required
        >
          <option value="">Seleccione un tipo de producto</option>
          {tiposProductos
            .filter(tipo => tipo.tipo_status === 'A') // Filtrar solo tipos de productos activos
            .map(tipo => (
              <option key={tipo.tipo_id} value={tipo.tipo_id}>
                {tipo.tipo_nombre}
              </option>
          ))}
        </Form.Control>
      </Form.Group>
      <Button variant="success" type="submit">
        <FontAwesomeIcon icon={faSave} /> Guardar Producto
      </Button>
      <Button variant="secondary" className="ms-2" onClick={onClose}>
        Volver
      </Button>
    </Form>
  );
};

export default ProductForm;
