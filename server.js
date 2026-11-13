require('dotenv').config();

const express = require('express');
const path = require('path');
const session = require('express-session');
const mongoose = require('mongoose');
const Mensaje = require('./models/Mensaje');
const app = express();
const port = 3000;

// Conexión a MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Conectado a MongoDB Atlas en la nube');
    })
    .catch(error => {
        console.error('Error de conexión a MongoDB:', error);
    });

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configuración de sesiones
app.use(session({
    secret: 'claveSecretaClaseNode2026',
    resave: false,
    saveUninitialized: false
}));

// Middleware para verificar si el usuario es administrador
function verificarAutenticacion(req, res, next) {
    if (req.session && req.session.esAdmin) {
        return next();
    }
    res.redirect('/login');
}

app.use(express.static(path.join(__dirname, 'public')));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/bootstrap', express.static(
    path.join(__dirname, 'node_modules/bootstrap/dist')
));

app.use('/bootstrap-icons', express.static(
    path.join(__dirname, 'node_modules/bootstrap-icons/font')
));

app.get('/', (req, res) => {
    res.render('inicio', {
        titulo: 'Inicio',
        paginaactual: 'inicio',
        loginAdmin: req.session.esAdmin
    });
});


app.get('/reportar', (req, res) => {
    res.render('reportar', {
        titulo: 'Reportar una falla',
        paginaactual: 'reportar',
        mensajeServidor: null,
        loginAdmin: req.session.esAdmin
    });
});

// Guardar un reporte en MongoDB
app.post('/reportar', async (req, res) => {
    try {
        // 1. Recibir los datos del formulario
        const nombre = req.body.nombre.trim();
        const ubicacion = req.body.ubicacion.trim();
        const descripcion = req.body.descripcion.trim();
        // 2. Crear un nuevo reporte
        const nuevoTicket = new Mensaje({
            nombre: nombre,
            ubicacion: ubicacion,
            descripcion: descripcion
        });

        // 3. Guardar el reporte en MongoDB
        await nuevoTicket.save();

        // 4. Mostrar mensaje de confirmación
        res.render('reportar', {
            titulo: 'Reportar una falla',
            paginaactual: 'reportar',
            mensajeServidor: `¡Gracias, ${nombre}! Tu reporte fue registrado correctamente.`,
            loginAdmin: req.session.esAdmin
        });

    } catch (error) {

        console.error('Error al guardar el reporte:', error);

        res.render('reportar', {
            titulo: 'Reportar una falla',
            paginaactual: 'reportar',
            mensajeServidor: 'No fue posible guardar tu reporte. Inténtalo nuevamente.',
            loginAdmin: req.session.esAdmin
        });
    }
});

// --- RUTAS DE AUTENTICACIÓN ---
// Mostrar el formulario de Login
app.get('/login', (req, res) => {
    res.render('login', {
        titulo: 'Iniciar sesión',
        paginaactual: 'login',
        errorLogin: null,
        loginAdmin: req.session.esAdmin
    });
});

// Validar las credenciales del administrador
app.post('/login', (req, res) => {
    const { usuario, contrasena } = req.body;
    if (usuario === 'admin' && contrasena === '12345') {
        req.session.esAdmin = true;
        res.redirect('/panel');
    } else {
        res.render('login', {
            titulo: 'Iniciar sesión',
            paginaactual: 'login',
            errorLogin: 'Credenciales incorrectas',
            loginAdmin: false
        });
    }
});

// Cerrar sesión
app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

// Mostrar los reportes almacenados en MongoDB
app.get('/panel', verificarAutenticacion, async (req, res) => {
    try {
        // Consultar todos los reportes y ordenarlos por fecha
        const tickets = await Mensaje.find().sort({ fecha: -1 });
        // Enviar los reportes a la vista
        res.render('panel', {
            titulo: 'Panel de tickets',
            paginaactual: 'panel',
            tickets: tickets,
            loginAdmin: req.session.esAdmin
        });
    } catch (error) {
        console.error('Error al consultar los reportes:', error);
        res.render('panel', {
            titulo: 'Panel de tickets',
            paginaactual: 'panel',
            tickets: [],
            loginAdmin: req.session.esAdmin
        });
    }
});

// Resolver un ticket almacenado en MongoDB
app.post('/panel/resolver', verificarAutenticacion, async (req, res) => {
    try {
        // Recibir el ID del ticket
        const idTicket = req.body.idTicket;
        // Eliminar el reporte utilizando el ID de MongoDB
        await Mensaje.findByIdAndDelete(idTicket);
        // Regresar al panel actualizado
        res.redirect('/panel');
    } catch (error) {
        console.error('Error al resolver el ticket:', error);
        res.redirect('/panel');
    }
});

app.listen(port, () => {
    console.log(`Servidor HelpDesk escuchando en http://localhost:${port}`);
});
