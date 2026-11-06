const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3000;
const RUTA_JSON = path.join(__dirname, 'tickets.json');


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.use(express.static(path.join(__dirname, 'public')));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/bootstrap', express.static(
    path.join(__dirname, 'node_modules/bootstrap/dist')
));

app.use('/bootstrap-icons', express.static(
    path.join(__dirname, 'node_modules/bootstrap-icons/font')
));

app.get('/', (req, res) => {
    res.render('inicio', {titulo: 'Inicio', paginaactual: 'inicio' });
});


app.get('/reportar', (req, res) => {
    res.render('reportar', {titulo: 'Reportar una falla', paginaactual: 'reportar', mensajeServidor: null });
});

app.post('/reportar', (req, res) => {
    const nombre = req.body.nombre.trim();
    const ubicacion = req.body.ubicacion.trim();
    const descripcion = req.body.descripcion.trim();
    let tickets = [];

    if (fs.existsSync(RUTA_JSON)) {
        const contenido = fs.readFileSync(RUTA_JSON, 'utf8');
        if (contenido.trim() !== '') {tickets = JSON.parse(contenido); }
    }
    const nuevoTicket = {
        id: Date.now(),
        nombre: nombre,
        ubicacion: ubicacion,
        descripcion: descripcion,
        fecha: new Date().toLocaleString('es-CO')
    };
    tickets.push(nuevoTicket);
    fs.writeFileSync(RUTA_JSON, JSON.stringify(tickets, null, 2), 'utf8' );
    res.render('reportar', {
        titulo: 'Reportar una falla',
        paginaactual: 'reportar',
        mensajeServidor: `¡Gracias, ${nombre}! Tu reporte fue registrado correctamente.`
    });
});

app.get('/panel', (req, res) => {
    let tickets = [];
    if (fs.existsSync(RUTA_JSON)) {
        const contenido = fs.readFileSync(RUTA_JSON, 'utf8');
        if (contenido.trim() !== '') {tickets = JSON.parse(contenido); }
    }
    res.render('panel', {
        titulo: 'Panel de tickets',
        paginaactual: 'panel',
        tickets: tickets
    });
});

app.post('/panel/resolver', (req, res) => {
    const idTicket = req.body.idTicket;
    let tickets = [];
    if (fs.existsSync(RUTA_JSON)) {
        const contenido = fs.readFileSync(RUTA_JSON, 'utf8');
        if (contenido.trim() !== '') {
            tickets = JSON.parse(contenido);
        }
    }
    tickets = tickets.filter(ticket => {
        return String(ticket.id) !== String(idTicket);
    });
    fs.writeFileSync(
        RUTA_JSON,
        JSON.stringify(tickets, null, 2),
        'utf8'
    );
    res.redirect('/panel');
});

app.listen(port, () => {
    console.log(`Servidor HelpDesk escuchando en http://localhost:${port}`);
});
