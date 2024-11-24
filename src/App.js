import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import AlbumList from './components/AlbumList';
import ArtistList from './components/ArtistList';
import CatalogList from './components/CatalogList';
import ProductList from './components/ProductList';
import ProductForm from './components/ProductForm';
import AlbumForm from './components/AlbumForm';
import ArtistForm from './components/ArtistForm';
import CatalogForm from './components/CatalogForm';
import TipoProductoList from './components/TipoProductoList';
import TipoProductoForm from './components/TipoProductoForm';
import ProveedorList from './components/ProveedorList';
import ProveedorForm from './components/ProveedorForm';
import EdificioList from './components/EdificioList';
import EdificioForm from './components/EdificioForm';
import UbicacionForm from './components/UbicacionForm';
import UbicacionList from './components/UbicacionList';
import InventarioList from './components/InventarioList';
import InventarioForm from './components/InventarioForm';
import StockList from './components/StockList';
import StockForm from './components/StockForm';

const App = () => {
  const isAuthenticated = () => {
    return localStorage.getItem('user') !== null;
  };

  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated()) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  return (
    <Router>
      {isAuthenticated() && <Navbar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/productos" element={
          <ProtectedRoute>
            <ProductList />
          </ProtectedRoute>
        } />
        <Route path="/productos/agregar" element={
          <ProtectedRoute>
            <ProductForm />
          </ProtectedRoute>
        } />
        <Route path="/productos/:producto_id/editar" element={
          <ProtectedRoute>
            <ProductForm />
          </ProtectedRoute>
        } />
        <Route path="/albums" element={
          <ProtectedRoute>
            <AlbumList />
          </ProtectedRoute>
        } />
        <Route path="/albums/agregar" element={
          <ProtectedRoute>
            <AlbumForm />
          </ProtectedRoute>
        } />
        <Route path="/albums/:album_id/editar" element={
          <ProtectedRoute>
            <AlbumForm />
          </ProtectedRoute>
        } />
        <Route path="/artistas" element={
          <ProtectedRoute>
            <ArtistList />
          </ProtectedRoute>
        } />
        <Route path="/artistas/agregar" element={
          <ProtectedRoute>
            <ArtistForm />
          </ProtectedRoute>
        } />
        <Route path="/artistas/:artista_id/editar" element={
          <ProtectedRoute>
            <ArtistForm />
          </ProtectedRoute>
        } />
        <Route path="/catalogos" element={
          <ProtectedRoute>
            <CatalogList />
          </ProtectedRoute>
        } />
        <Route path="/catalogos/agregar" element={
          <ProtectedRoute>
            <CatalogForm />
          </ProtectedRoute>
        } />
        <Route path="/catalogos/:catalogo_id/editar" element={
          <ProtectedRoute>
            <CatalogForm />
          </ProtectedRoute>
        } />
        <Route path="/tipoproductos" element={
          <ProtectedRoute>
            <TipoProductoList />
          </ProtectedRoute>
        } />
        <Route path="/tipoproductos/agregar" element={
          <ProtectedRoute>
            <TipoProductoForm />
          </ProtectedRoute>
        } />
        <Route path="/tipoproductos/:tipo_id/editar" element={
          <ProtectedRoute>
            <TipoProductoForm />
          </ProtectedRoute>
        } />
        <Route path="/proveedores" element={
          <ProtectedRoute>
            <ProveedorList />
          </ProtectedRoute>
        } />
        <Route path="/proveedores/agregar" element={
          <ProtectedRoute>
            <ProveedorForm />
          </ProtectedRoute>
        } />
        <Route path="/proveedores/:proveedor_id/editar" element={
          <ProtectedRoute>
            <ProveedorForm />
          </ProtectedRoute>
        } />
        <Route path="/edificios" element={
          <ProtectedRoute>
            <EdificioList />
          </ProtectedRoute>
        } />
        <Route path="/edificios/agregar" element={
          <ProtectedRoute>
            <EdificioForm />
          </ProtectedRoute>
        } />
        <Route path="/edificios/:edificio_id/editar" element={
          <ProtectedRoute>
            <EdificioForm />
          </ProtectedRoute>
        } />
        <Route path="/ubicaciones" element={
          <ProtectedRoute>
            <UbicacionList />
          </ProtectedRoute>
        } />
        <Route path="/ubicaciones/agregar" element={
          <ProtectedRoute>
            <UbicacionForm />
          </ProtectedRoute>
        } />
        <Route path="/ubicaciones/:ubicacion_id/editar" element={
          <ProtectedRoute>
            <UbicacionForm />
          </ProtectedRoute>
        } />
        <Route path="/inventarios" element={
          <ProtectedRoute>
            <InventarioList />
          </ProtectedRoute>
        } />
        <Route path="/inventarios/agregar" element={
          <ProtectedRoute>
            <InventarioForm />
          </ProtectedRoute>
        } />
        <Route path="/inventarios/:inventario_id/editar" element={
          <ProtectedRoute>
            <InventarioForm />
          </ProtectedRoute>
        } />
        <Route path="/stocks" element={
          <ProtectedRoute>
            <StockList />
          </ProtectedRoute>
        } />
        <Route path="/stocks/agregar" element={
          <ProtectedRoute>
            <StockForm />
          </ProtectedRoute>
        } />
        <Route path="/stocks/:stock_id/editar" element={
          <ProtectedRoute>
            <StockForm />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
};

export default App;

