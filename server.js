require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const motoRoutes = require('./routes/motoRoutes');
const User = require('./models/User');

const app = express();

// Configuración de Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Configuración de motor de vistas EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Conexión a MongoDB (local o Azure Cosmos DB)
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Conectado exitosamente a la base de datos NoSQL');
    
    // Crear usuario admin por defecto si la base está vacía
    const adminExiste = await User.findOne({ email: 'admin@taller.com' });
    if (!adminExiste) {
      await User.create({
        nombre: 'Administrador Principal',
        email: 'admin@taller.com',
        password: 'admin12345Password',
        rol: 'admin'
      });
      console.log('Usuario inicial creado: admin@taller.com / admin12345Password');
    }
  })
  .catch(err => {
    console.log('Advertencia de conexión a BD:', err.message);
  });

// Rutas
app.use('/', authRoutes);
app.use('/', motoRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor activo en el puerto ${PORT}`);
});