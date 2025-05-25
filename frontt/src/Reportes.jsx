import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line
} from 'recharts';
import './style.css';

export default function Reportes() {
  const navigate = useNavigate();
  const [habitaciones, setHabitaciones] = useState(null); // null = cargando

  /* --------- 1. Simular carga de datos ficticios ---------------- */
  useEffect(() => {
    const timer = setTimeout(() => {
      const mockRooms = [
        { id: 1, numero: '101', piso: 1, estado: 'Ocupada',   tarifa: 980 },
        { id: 2, numero: '102', piso: 1, estado: 'Disponible',tarifa: 950 },
        { id: 3, numero: '103', piso: 1, estado: 'Reservada', tarifa: 920 },
        { id: 4, numero: '104', piso: 1, estado: 'Disponible',tarifa: 890 },
        { id: 5, numero: '201', piso: 2, estado: 'Ocupada',   tarifa: 1150 },
        { id: 6, numero: '202', piso: 2, estado: 'Disponible',tarifa: 1100 },
        { id: 7, numero: '203', piso: 2, estado: 'Reservada', tarifa: 1010 },
        { id: 8, numero: '301', piso: 3, estado: 'Disponible',tarifa: 1400 },
      ];
      setHabitaciones(mockRooms);
    }, 600);
    return () => clearTimeout(timer);
  }, []);
  /* -------------------------------------------------------------- */

  /* 2. Spinner de carga */
  if (habitaciones === null) {
    return (
      <div className="page">
        <div className="top-bar"><h1>Reportes</h1></div>
        <p style={{ padding: 40 }}>Cargando habitaciones…</p>
      </div>
    );
  }

  /* 3. Conteos y métricas */
  const ocupadas    = habitaciones.filter(h => h.estado === 'Ocupada').length;
  const reservadas  = habitaciones.filter(h => h.estado === 'Reservada').length;
  const disponibles = habitaciones.filter(h => h.estado === 'Disponible').length;

  const total       = habitaciones.length;
  const ocupacion   = ((ocupadas + reservadas) / total) * 100;
  const tarifaProm  = habitaciones.reduce((s,h)=>s+h.tarifa,0) / total;

  /* 4. Datos para gráficos */
  const pieData = [
    { name: 'Ocupadas / Reservadas', value: ocupadas + reservadas },
    { name: 'Disponibles',           value: disponibles },
  ];
  const barData = [
    { name: 'Ocupadas',    value: ocupadas },
    { name: 'Reservadas',  value: reservadas },
    { name: 'Disponibles', value: disponibles },
  ];
  const monthlyIncome = [        // ingreso por renta (ficticio)
    { mes: 'Ene', ingreso: 43520 },
    { mes: 'Feb', ingreso: 42110 },
    { mes: 'Mar', ingreso: 48680 },
    { mes: 'Abr', ingreso: 50290 },
    { mes: 'May', ingreso: 46730 },
    { mes: 'Jun', ingreso: 51300 },
  ];
  const COLORS = ['#e74c3c', '#2ecc71', '#f39c12'];

  /* 5. Render */
  return (
    <div className="page">
      <div className="top-bar">
        <h1>Reportes</h1>
        <button className="btn" onClick={() => navigate('/dashboard')}>
          Regresar
        </button>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card"><h3>Total Habitaciones</h3><p>{total}</p></div>
        <div className="kpi-card"><h3>Ocupadas</h3><p>{ocupadas}</p></div>
        <div className="kpi-card"><h3>Reservadas</h3><p>{reservadas}</p></div>
        <div className="kpi-card"><h3>Disponibles</h3><p>{disponibles}</p></div>
        <div className="kpi-card"><h3>% Ocupación</h3><p>{ocupacion.toFixed(0)}%</p></div>
        <div className="kpi-card"><h3>Tarifa Promedio</h3><p>${tarifaProm.toFixed(0)}</p></div>
      </div>

      <div className="center-wrap">
        {/* Pie Ocupación */}
        <div className="content-box">
          <h2>Porcentaje de Ocupación</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%" cy="50%" outerRadius={110}
                label={({ percent }) => percent ? `${(percent*100).toFixed(0)}%` : ''}
              >
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip formatter={v=>`${v} hab.`}/>
              <Legend verticalAlign="bottom"/>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Barra Estados */}
        <div className="content-box">
          <h2>Distribución por Estado</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3"/>
              <XAxis dataKey="name"/>
              <YAxis allowDecimals={false}/>
              <Tooltip formatter={v=>`${v} hab.`}/>
              <Bar dataKey="value">
                {barData.map((_,i)=><Cell key={i} fill={COLORS[i]}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Línea Ingreso Mensual */}
        <div className="content-box">
          <h2>Ingreso por Renta (MXN)</h2>
          <ResponsiveContainer width="100%" height={230}>
            <LineChart data={monthlyIncome}>
              <CartesianGrid strokeDasharray="3 3"/>
              <XAxis dataKey="mes"/>
              <YAxis />
              <Tooltip formatter={v=>`$${v.toLocaleString()}`} />
              <Line type="monotone" dataKey="ingreso" stroke="#3498db" strokeWidth={2} dot={{ r:4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Tabla de habitaciones ocupadas / reservadas */}
        <div className="content-box">
          <h2>Habitaciones en Uso</h2>
          <table className="mini-table">
            <thead>
              <tr><th>Número</th><th>Piso</th><th>Estado</th><th>Tarifa</th></tr>
            </thead>
            <tbody>
              {habitaciones.filter(h=>h.estado!=='Disponible').map(h=>(
                <tr key={h.id}>
                  <td>{h.numero}</td><td>{h.piso}</td>
                  <td>{h.estado}</td><td>${h.tarifa}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
