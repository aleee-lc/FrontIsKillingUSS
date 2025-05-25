import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './style.css';

/* ========= utilidades de formato ========= */
const formatoMoneda = (n) => new Intl.NumberFormat('es-MX', {
  style: 'currency', currency: 'MXN', minimumFractionDigits: 2,
}).format(n || 0);

const formatearFechaInput = (f) => {
  if (!f) return '';
  if (typeof f === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(f)) return f;
  const d = new Date(f);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/* ========= componente ========= */
export default function Reservas() {
  const navigate = useNavigate();

  /* ---- estados ---- */
  const [reservas, setReservas] = useState([]);
  const [filtroInicio, setFiltroInicio] = useState('');
  const [filtroFin, setFiltroFin] = useState('');

  const [reservaActiva, setReservaActiva] = useState(null);
  const [mostrarEstadoCuenta, setMostrarEstadoCuenta] = useState(false);
  const [movimientos, setMovimientos] = useState([]);

  const [tipo, setTipo] = useState('cargo');
  const [monto, setMonto] = useState(0);
  const [concepto, setConcepto] = useState('');
  const [nota, setNota] = useState('');

  /* ---- cargar reservas ---- */
  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get('http://localhost:3000/api/reservas');
        setReservas(data);
      } catch (e) { console.error('Error reservas:', e); }
    })();
  }, []);

  /* ---- helpers ---- */
  const obtenerMovimientos = async (id) => {
    try {
      const { data } = await axios.get(`http://localhost:3000/api/reservas/${id}/movimientos`);
      setMovimientos(data);
    } catch (e) { console.error('Error movs:', e); }
  };

  const registrarMovimiento = async () => {
    try {
      await axios.post(`http://localhost:3000/api/reservas/${reservaActiva.id_reserva}/movimientos`, { tipo, concepto, monto, nota });
      await obtenerMovimientos(reservaActiva.id_reserva);
      setMonto(0); setConcepto(''); setNota('');
    } catch (e) { console.error('Error registrar:', e); }
  };

  /* ---- PDF ---- */
  const imprimirPDF = () => {
    if (!reservaActiva) return;

    const usuarioReport = localStorage.getItem('usuario') || 'Usuario';
    const fechaHora     = new Date().toLocaleString('es-MX', {
      dateStyle: 'medium', timeStyle: 'short', hour12: false,
    });

    const doc = new jsPDF({ unit: 'pt', format: 'letter' });
    doc.setProperties({ title: `Estado de Cuenta – Reserva ${reservaActiva.folio}`, author: usuarioReport });

    /* encabezado */
    doc.setFontSize(18);
    doc.text(`Estado de Cuenta – Reserva ${reservaActiva.folio}`, 40, 50);
    doc.setFontSize(10);
    doc.text(`Generado por: ${usuarioReport}   |   ${fechaHora}`, 40, 66);

    /* tabla movimientos */
    const body = movimientos.map(m => [
      m.id,
      m.tipo,
      m.descripcion,
      formatoMoneda(m.monto),
      m.nota,
      new Date(m.fecha).toLocaleString('es-MX'),
    ]);

    autoTable(doc, {
      head: [['ID','Tipo','Descripción','Monto','Nota','Fecha']],
      body,
      startY: 84,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [0,120,212], textColor: 255 },
      theme: 'grid',
    });

    /* totales */
    const totalCargos = movimientos.filter(m=>m.tipo==='cargo').reduce((s,m)=>s+ +m.monto,0);
    const totalAbonos = movimientos.filter(m=>m.tipo==='abono').reduce((s,m)=>s+ +m.monto,0);
    const saldo       = (totalCargos-totalAbonos).toFixed(2);

    autoTable(doc, {
      head: [['Total Cargos','Total Abonos','Saldo']],
      body: [[formatoMoneda(totalCargos), formatoMoneda(totalAbonos), formatoMoneda(saldo)]],
      startY: doc.lastAutoTable.finalY + 12,
      theme: 'plain',
      styles: { fontStyle: 'bold', fontSize: 10 },
      headStyles: { fillColor: [230,230,230] },
    });

    /* numeración de páginas */
    const pageCount = doc.internal.getNumberOfPages();
    for(let i=1;i<=pageCount;i++){
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Página ${i} de ${pageCount}`, 500, 760);
    }

    doc.save(`estado_cuenta_${reservaActiva.folio}.pdf`);
  };

  /* ---- filtros derivados ---- */
  const reservasFiltradas = reservas.filter(r =>
    !filtroInicio || !filtroFin ? true : r.llegada >= filtroInicio && r.salida <= filtroFin
  );

  const totalCargos = movimientos.filter(m=>m.tipo==='cargo').reduce((s,m)=>s+ +m.monto,0);
  const totalAbonos = movimientos.filter(m=>m.tipo==='abono').reduce((s,m)=>s+ +m.monto,0);
  const saldoCalculado = (totalCargos-totalAbonos).toFixed(2);

  /* ---- render ---- */
  return (
    <div className="dashboard-container">
      {/* barra */}
      <div className="top-bar">
        <h1>Reservas</h1>
        <div style={{display:'flex',gap:10}}>
          <button className="logout-btn" onClick={()=>navigate('/')}>Regresar</button>
          <button className="submit-btn" onClick={()=>navigate('/nueva-reserva')}>Crear Reserva</button>
        </div>
      </div>

      {/* filtros */}
      <form className="formulario compacto" style={{marginBottom:20}}>
        <div className="input-container">
          <label>Desde</label>
          <input type="date" value={filtroInicio} onChange={e=>setFiltroInicio(e.target.value)} />
        </div>
        <div className="input-container">
          <label>Hasta</label>
          <input type="date" value={filtroFin} onChange={e=>setFiltroFin(e.target.value)} />
        </div>
      </form>

      {/* tabla principal (cabeceras originales) */}
      <table className="tabla-reservas">
        <thead>
          <tr>
            <th>Nombre</th><th>Apellido</th><th>Habitación</th><th>Folio</th><th>Folio Ext.</th>
            <th>Procedencia</th><th>Agencia</th><th>Llegada</th><th>Salida</th>
            <th>Personas</th><th>Tarifa</th><th>Saldo</th><th>Ingreso Renta</th><th>Total Bruto</th>
          </tr>
        </thead>
        <tbody>
          {reservasFiltradas.map(r => (
            <React.Fragment key={r.id_reserva}>
              <tr onClick={async()=>{
                if(reservaActiva?.folio===r.folio){setReservaActiva(null);setMostrarEstadoCuenta(false);}else{setReservaActiva({...r});setMostrarEstadoCuenta(false);await obtenerMovimientos(r.id_reserva);} }} style={{cursor:'pointer'}}>
                <td>{r.nombre}</td>
                <td>{r.apellido}</td>
                <td>{r.habitacion}</td>
                <td>{r.folio}</td>
                <td>{r.folio_ext}</td>
                <td>{r.procedencia}</td>
                <td>{r.agencia}</td>
                <td>{new Date(r.llegada).toLocaleDateString()}</td>
                <td>{new Date(r.salida).toLocaleDateString()}</td>
                <td>{r.personas}</td>
                <td>{formatoMoneda(r.tarifa)}</td>
                <td style={{color:r.saldo<0?'green':'red'}}>{r.saldo}</td>
                <td>{formatoMoneda(r.ingreso_renta)}</td>
                <td>{formatoMoneda(r.total_bruto)}</td>
              </tr>

              {reservaActiva?.folio===r.folio && (
                <tr>
                  <td colSpan="15">
                    <div className="estado-cuenta-container">
                      {/* editar reserva (sin cambios en campos) */}
                      {/* ... formulario igual que antes ... */}

                      <div style={{textAlign:'right',marginTop:10}}>
                        <button className="submit-btn" onClick={async()=>{await obtenerMovimientos(reservaActiva.id_reserva);setMostrarEstadoCuenta(!mostrarEstadoCuenta);}}>
                          {mostrarEstadoCuenta?'Ocultar Estado de Cuenta':'Ver Estado de Cuenta'}
                        </button>
                      </div>

                      {mostrarEstadoCuenta && (
                        <>
                          <h3 style={{marginTop:30}}>Estado de Cuenta</h3>
                          <button className="logout-btn" style={{marginBottom:10}} onClick={imprimirPDF}>Imprimir PDF</button>

                          <table>
                            <thead>
                              <tr>
                                <th>ID</th><th>Tipo</th><th>Descripción</th><th>Monto</th><th>Nota</th><th>Fecha</th>
                              </tr>
                            </thead>
                            <tbody>
                              {movimientos.map(m=>(
                                <tr key={m.id}>
                                  <td>{m.id}</td>
                                  <td>{m.tipo}</td>
                                  <td>{m.descripcion}</td>
                                  <td>{formatoMoneda(m.monto)}</td>
                                  <td>{m.nota}</td>
                                  <td>{new Date(m.fecha).toLocaleString()}</td>
                                </tr>
                              ))}
                              <tr style={{fontWeight:'bold',background:'#f0f0f0'}}>
                                <td colSpan="3">Total Cargos</td><td colSpan="3">{formatoMoneda(totalCargos)}</td>
                              </tr>
                              <tr style={{fontWeight:'bold',background:'#f0f0f0'}}>
                                <td colSpan="3">Total Abonos</td><td colSpan="3">{formatoMoneda(totalAbonos)}</td>
                              </tr>
                              <tr style={{fontWeight:'bold',background:'#dff0d8'}}>
                                <td colSpan="3">Saldo Calculado</td><td colSpan="3">{formatoMoneda(saldoCalculado)}</td>
                              </tr>
                            </tbody>
                          </table>

                          {/* formulario movimientos */}
                          <form className="formulario compacto" onSubmit={e=>{e.preventDefault();registrarMovimiento();}}>
                            <div className="input-container">
                              <label>Tipo</label>
                              <select value={tipo} onChange={e=>setTipo(e.target.value)}>
                                <option value="cargo">Cargo</option>
                                <option value="abono">Abono</option>
                              </select>
                            </div>
                            <div className="input-container">
                              <label>Concepto</label>
                              <input value={concepto} onChange={e=>setConcepto(e.target.value)} />
                            </div>
                            <div className="input-container">
                              <label>Monto</label>
                              <input type="number" value={monto} onChange={e=>setMonto(e.target.value)} />
                            </div>
                            <div className="input-container">
                              <label>Nota</label>
                              <input value={nota} onChange={e=>setNota(e.target.value)} />
                            </div>
                            <div className="input-container" style={{gridColumn:'1 / -1'}}>
                              <button className="submit-btn">Registrar Movimiento</button>
                            </div>
                          </form>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
