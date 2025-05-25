import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './style.css';

const getEstadoColor = (estado) => {
  switch (estado) {
    case 'Disponible': return 'green';
    case 'Ocupada': return 'red';
    case 'Mantenimiento': return 'orange';
    case 'Reservada': return 'purple';
    default: return 'gray';
  }
};

const Habitaciones = () => {
  const [habitaciones, setHabitaciones] = useState([
    { numero: '101', tipo: 'Sencilla', estado: 'Disponible' },
    { numero: '102', tipo: 'Doble', estado: 'Ocupada' },
    { numero: '103', tipo: 'Suite', estado: 'Mantenimiento' },
    { numero: '104', tipo: 'Sencilla', estado: 'Reservada' },
    { numero: '105', tipo: 'Doble', estado: 'Disponible' },
    { numero: '106', tipo: 'Suite', estado: 'Disponible' },
  ]);

  const [seleccionada, setSeleccionada] = useState(null);
  const navigate = useNavigate();

  const manejarClick = (hab) => {
    setSeleccionada(hab.numero === seleccionada?.numero ? null : hab);
  };

  const cambiarEstado = (nuevoEstado) => {
    setHabitaciones(prev =>
      prev.map(h =>
        h.numero === seleccionada.numero ? { ...h, estado: nuevoEstado } : h
      )
    );
    setSeleccionada(null);
  };

  const iniciarCheckIn = () => {
    navigate(`/nueva-reserva?habitacion=${seleccionada.numero}`);
  };

  return (
    <div className="dashboard-container full-height">
      <div className="top-bar">
        <h1>Rack de Habitaciones</h1>
        <button className="logout-btn" onClick={() => navigate('/')}>Regresar</button>
      </div>

      <div className="rack-grid scrollable">
        {habitaciones.map((hab, index) => (
          <div
            key={index}
            className={`habitacion-box ${seleccionada?.numero === hab.numero ? 'seleccionada' : ''}`}
            style={{ borderColor: getEstadoColor(hab.estado) }}
            onClick={() => manejarClick(hab)}
          >
            <h3>Habitación {hab.numero}</h3>
            <p>Tipo: {hab.tipo}</p>
            <p>Estado: <strong style={{ color: getEstadoColor(hab.estado) }}>{hab.estado}</strong></p>
          </div>
        ))}
      </div>

      {seleccionada && (
        <div className="habitacion-detalle">
          <h2>Detalles de la Habitación {seleccionada.numero}</h2>
          <p><strong>Tipo:</strong> {seleccionada.tipo}</p>
          <p><strong>Estado actual:</strong> <span style={{ color: getEstadoColor(seleccionada.estado) }}>{seleccionada.estado}</span></p>
          <div style={{ marginTop: '15px' }}>
            <button className="submit-btn" onClick={iniciarCheckIn} disabled={seleccionada.estado !== 'Disponible'}>
              Hacer Check-In
            </button>
            <button className="submit-btn" onClick={() => cambiarEstado('Disponible')} disabled={seleccionada.estado !== 'Ocupada'} style={{ marginLeft: '10px' }}>
              Hacer Check-Out
            </button>
            <button className="submit-btn" onClick={() => cambiarEstado('Mantenimiento')} style={{ marginLeft: '10px' }}>
              Marcar Mantenimiento
            </button>
            <button className="submit-btn" onClick={() => cambiarEstado('Reservada')} style={{ marginLeft: '10px' }}>
              Marcar Reservada
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Habitaciones;
