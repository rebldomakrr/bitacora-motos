const express = require('express');
const router = express.Router();
const Moto = require('../models/Moto');
const { verificarSesion, soloAdmin } = require('../middleware/auth');

// Dashboard principal: Listar todas las motos (Accesible por Admin y Mecánico)
router.get('/', verificarSesion, async (req, res) => {
  try {
    const motos = await Moto.find().sort({ fechaRegistro: -1 });
    res.render('dashboard', { motos });
  } catch (error) {
    res.status(500).send('Error al cargar las motos');
  }
});

// Registrar nueva moto (SÓLO ADMIN)
router.post('/motos/crear', verificarSesion, soloAdmin, async (req, res) => {
  const { placas, marca, modelo, anio, propNombre, propTelefono } = req.body;
  try {
    const nuevaMoto = new Moto({
      placas,
      marca,
      modelo,
      anio,
      propietario: {
        nombre: propNombre,
        telefono: propTelefono
      }
    });
    await nuevaMoto.save();
    res.redirect('/');
  } catch (error) {
    res.status(500).send('Error al registrar la moto (verifica que las placas no estén repetidas)');
  }
});

// Ver detalle de una moto y su historial de servicios (Admin y Mecánico)
router.get('/motos/:id', verificarSesion, async (req, res) => {
  try {
    const moto = await Moto.findById(req.params.id);
    if (!moto) return res.status(404).send('Moto no encontrada');
    res.render('detalle-moto', { moto });
  } catch (error) {
    res.status(500).send('Error al buscar la moto');
  }
});

// Agregar servicio a la bitácora (Permitido para ADMIN y MECÁNICO)
router.post('/motos/:id/servicio', verificarSesion, async (req, res) => {
  const { tipo, kilometraje, detalles, costo } = req.body;
  try {
    const moto = await Moto.findById(req.params.id);
    if (!moto) return res.status(404).send('Moto no encontrada');

    moto.servicios.push({
      tipo,
      kilometraje,
      detalles,
      costo: costo || 0,
      realizadoPor: req.usuario.nombre // Se toma del usuario logueado en la sesión
    });

    await moto.save();
    res.redirect(`/motos/${req.params.id}`);
  } catch (error) {
    res.status(500).send('Error al agregar el servicio');
  }
});

// Eliminar moto (SÓLO ADMIN)
router.post('/motos/:id/eliminar', verificarSesion, soloAdmin, async (req, res) => {
  try {
    await Moto.findByIdAndDelete(req.params.id);
    res.redirect('/');
  } catch (error) {
    res.status(500).send('Error al eliminar la moto');
  }
});

module.exports = router;