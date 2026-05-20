import { useState, useEffect } from 'react';
import axios from 'axios';
import { Pencil, Save, X } from 'lucide-react';

const API_URL = 'http://localhost:3001/api';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
};

const Inventario = () => {
  const [refacciones, setRefacciones] = useState([]);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [stock, setStock] = useState('');
  const [marca, setMarca] = useState('');
  const [numeroParte, setNumeroParte] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    fetchRefacciones();
  }, []);

  const fetchRefacciones = async () => {
    try {
      const res = await axios.get(`${API_URL}/refacciones`);
      setRefacciones(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/refacciones`, { nombre, descripcion, precio, stock, marca, numeroParte });
      setNombre(''); setDescripcion(''); setPrecio(''); setStock(''); setMarca(''); setNumeroParte('');
      fetchRefacciones();
    } catch (error) {
      console.error(error);
    }
  };

  const startEdit = (r) => {
    setEditingId(r.id);
    setEditData(r);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`${API_URL}/refacciones/${editingId}`, editData);
      setEditingId(null);
      setEditData({});
      fetchRefacciones();
    } catch (error) {
      console.error("Error al actualizar", error);
      alert("No se pudo actualizar el registro");
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
        <h2>Inventario y Refacciones</h2>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Agregar Refacción</h3>
        <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
          <input className="input" placeholder="Nombre de pieza" value={nombre} onChange={e => setNombre(e.target.value)} required />
          <input className="input" placeholder="Marca (Ej. Bosch)" value={marca} onChange={e => setMarca(e.target.value)} />
          <input className="input" placeholder="Número de Parte (OEM)" value={numeroParte} onChange={e => setNumeroParte(e.target.value)} />
          <input className="input" style={{ gridColumn: 'span 3' }} placeholder="Descripción (opcional)" value={descripcion} onChange={e => setDescripcion(e.target.value)} />
          <input className="input" type="number" step="0.01" placeholder="Precio Venta ($)" value={precio} onChange={e => setPrecio(e.target.value)} required />
          <input className="input" type="number" placeholder="Stock Inicial" value={stock} onChange={e => setStock(e.target.value)} required />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
             <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>Guardar</button>
          </div>
        </form>
      </div>

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '1rem' }}>ID</th>
              <th style={{ padding: '1rem' }}>Refacción</th>
              <th style={{ padding: '1rem' }}>Marca / OEM</th>
              <th style={{ padding: '1rem' }}>Precio unitario</th>
              <th style={{ padding: '1rem' }}>Stock Disponible</th>
              <th style={{ padding: '1rem', textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {refacciones.map(r => (
              <tr key={r.id} style={{ borderBottom: '1px solid var(--border-color)', background: editingId === r.id ? 'rgba(59, 130, 246, 0.1)' : 'transparent' }}>
                <td style={{ padding: '1rem' }}>#{r.id}</td>
                
                {editingId === r.id ? (
                  <>
                    <td style={{ padding: '1rem' }}>
                      <input className="input" value={editData.nombre} onChange={e => setEditData({...editData, nombre: e.target.value})} style={{ marginBottom: '0.5rem' }} />
                      <input className="input" placeholder="Descripción" value={editData.descripcion || ''} onChange={e => setEditData({...editData, descripcion: e.target.value})} />
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <input className="input" placeholder="Marca" value={editData.marca || ''} onChange={e => setEditData({...editData, marca: e.target.value})} style={{ marginBottom: '0.5rem' }} />
                      <input className="input" placeholder="No. Parte" value={editData.numeroParte || ''} onChange={e => setEditData({...editData, numeroParte: e.target.value})} />
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <input className="input" type="number" step="0.01" value={editData.precio} onChange={e => setEditData({...editData, precio: e.target.value})} />
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <input className="input" type="number" value={editData.stock} onChange={e => setEditData({...editData, stock: e.target.value})} />
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <button className="btn btn-primary" onClick={handleUpdate} style={{ padding: '0.5rem', marginBottom: '0.5rem', width: '100%' }}><Save size={16} /> Guardar</button>
                      <button className="btn" onClick={cancelEdit} style={{ padding: '0.5rem', width: '100%' }}><X size={16} /> Cancelar</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td style={{ padding: '1rem', fontWeight: '500' }}>
                      {r.nombre}
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.descripcion}</div>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                      <div>{r.marca || '-'}</div>
                      <div style={{ fontSize: '0.75rem' }}>{r.numeroParte}</div>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--success-color)', fontWeight: 'bold' }}>
                      {formatCurrency(r.precio)}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span className={`badge ${r.stock > 5 ? 'badge-success' : 'badge-warning'}`}>
                        {r.stock} u.
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <button className="btn" onClick={() => startEdit(r)} title="Editar Refacción">
                        <Pencil size={18} />
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
            {refacciones.length === 0 && (
              <tr>
                <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Inventario vacío.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Inventario;
