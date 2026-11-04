const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { verificarSesion, soloAdmin } = require('../middleware/auth');

// Formulario de login
router.get('/login', (req, res) => {
  res.render('login', { error: null });
});

// Procesar login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const usuario = await User.findOne({ email });
    if (!usuario) {
      return res.render('login', { error: 'Credenciales inválidas (usuario no encontrado)' });
    }

    const esValida = await usuario.compararPassword(password);
    if (!esValida) {
      return res.render('login', { error: 'Credenciales inválidas (contraseña incorrecta)' });
    }

    // Generar Token JWT con ID y Rol
    const token = jwt.sign(
      { id: usuario._id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    // Guardar token en cookie segura
    res.cookie('token', token, { httpOnly: true });
    res.redirect('/');
  } catch (error) {
    res.render('login', { error: 'Ocurrió un error en el servidor' });
  }
});

// Cerrar sesión
router.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/login');
});

// Panel para gestionar usuarios (SÓLO ACCESIBLE POR ADMIN)
router.get('/usuarios', verificarSesion, soloAdmin, async (req, res) => {
  const usuarios = await User.find().select('-password');
  res.render('usuarios', { usuarios, mensaje: null });
});

// Crear nuevo usuario y asignarle rol (SÓLO ACCESIBLE POR ADMIN)
router.post('/usuarios/crear', verificarSesion, soloAdmin, async (req, res) => {
  const { nombre, email, password, rol } = req.body;
  try {
    const existe = await User.findOne({ email });
    if (existe) {
      const usuarios = await User.find().select('-password');
      return res.render('usuarios', { usuarios, mensaje: 'El correo ya está registrado.' });
    }

    const nuevoUsuario = new User({ nombre, email, password, rol });
    await nuevoUsuario.save();
    res.redirect('/usuarios');
  } catch (error) {
    res.status(500).send('Error creando usuario');
  }
});
// Ruta directa para crear el primer administrador
const bcrypt = require('bcryptjs'); // o require('bcrypt') según tengas en package.json

router.get('/registro-inicial', async (req, res) => {
  try {
    const totalUsuarios = await User.countDocuments();
    if (totalUsuarios > 0) {
      return res.send('Ya existen usuarios registrados en la base de datos.');
    }

    // Hasheo manual directo para evitar el conflicto con next()
    const salt = await bcrypt.genSalt(10);
    const passwordHashed = await bcrypt.hash('admin', salt);

    const admin = new User({
      nombre: 'Administrador',
      email: 'admin@taller.com',
      password: passwordHashed,
      rol: 'admin'
    });

    // Guardado omitiendo hooks problemáticos
    await User.collection.insertOne({
      nombre: admin.nombre,
      email: admin.email,
      password: passwordHashed,
      rol: admin.rol,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    res.send('¡Administrador creado con éxito! Correo: admin@taller.com | Contraseña: admin. Ya puedes ir a /login');
  } catch (error) {
    res.status(500).send('Error creando usuario inicial: ' + error.message);
  }
});
module.exports = router;