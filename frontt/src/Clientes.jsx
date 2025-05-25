import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './style.css';

return (
  <div className="page">
    <div className="top-bar">
        <h1>Clientes</h1>
        <div style={{display:'flex',gap:10}}>
          <button className="logout-btn" onClick={()=>navigate('/')}>Regresar</button>
        </div>
      </div>

    <div className="center-wrap">
      <div className="clientes-wrap">
        {/* ---------- toolbar ---------- */}
        <div className="clientes-toolbar">
          <input
            placeholder="Buscar por nombre..."
            value={search}
            onChange={e=>setSearch(e.target.value)}
          />
          <button className="submit-btn" onClick={()=>setShowForm(!showForm)}>
            {showForm ? 'Cancelar' : 'Agregar Cliente'}
          </button>
        </div>

        {/* ---------- formulario nuevo cliente ---------- */}
        {showForm && (
          <form className="formulario compacto" onSubmit={crearCliente}>
            {/* ... campos como antes ... */}
          </form>
        )}

        {/* ---------- tabla ---------- */}
        <table className="clientes-table">
          <thead>
            <tr>
              <th>ID</th><th>Nombre(s)</th><th>Ap.P</th><th>Ap.M</th><th>Correo</th>
              <th>Teléfono</th><th>Ciudad</th><th>Tarifa</th><th>Empresa</th><th>Status</th><th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map(c=>(
              <tr key={c.id_cliente}>
                {/* celdas o inputs */}
                <td>{c.id_cliente}</td>
                <td>{renderCell(c,'nombres')}</td>
                {/* ... demás columnas ... */}
                <td>
                  {editId===c.id_cliente
                    ? <>
                        <button className="btn-sm" onClick={()=>guardarEdicion(c.id_cliente)}>Guardar</button>
                        <button className="btn-sm" onClick={()=>setEditId(null)} style={{marginLeft:6}}>Cancelar</button>
                      </>
                    : <button className="btn-sm" onClick={()=>{setEditId(c.id_cliente);setEditRow(c);}}>
                        Editar
                      </button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);
