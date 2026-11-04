const jwt = require('jsonwebtoken');

// Verifica si el usuario tiene sesión activa
const verificarSesion = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.redirect('/login');
  }

  try {
    const decodificado = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decodificado; // { id, nombre, email, rol }
    res.locals.usuarioActual = decodificado; // Disponible para las vistas HTML/EJS
    next();
  } catch (error) {
    res.clearCookie('token');
    return res.redirect('/login');
  }
};

// Limita el acceso únicamente a usuarios con rol 'admin'
const soloAdmin = (req, res, next) => {
  if (req.usuario && req.usuario.rol === 'admin') {
    return next();
  }
  return res.status(403).send('Acceso denegado: Se requieren permisos de Administrador.');
};

module.exports = { verificarSesion, soloAdmin };