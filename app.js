const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// Configuración para Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Middleware para servir archivos estáticos
app.use(express.static('public'));

// Ruta para la página del formulario
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Ruta para manejar el formulario y archivos adjuntos
app.post('/submit', upload.single('dpiFile'), (req, res) => {
  const { nombre, email } = req.body;
  const dpiFilePath = req.file ? req.file.path : null;

  // Almacenar los datos del contacto en un archivo JSON
  const contact = {
    nombre,
    email,
    dpiFilePath,
  };

  fs.readFile('contacts.json', 'utf8', (err, data) => {
    if (err) {
      fs.writeFileSync('contacts.json', JSON.stringify([contact], null, 2));
    } else {
      const contacts = JSON.parse(data);
      contacts.push(contact);
      fs.writeFileSync('contacts.json', JSON.stringify(contacts, null, 2));
    }
    res.redirect('/uploads.html');
  });
});

// Ruta para mostrar y descargar archivos subidos
app.get('/uploads.html', (req, res) => {
  fs.readFile('contacts.json', 'utf8', (err, data) => {
    if (err) {
      res.send('No se encontraron archivos subidos.');
      return;
    }
    const contacts = JSON.parse(data);
    res.write('<h1>Archivos Subidos</h1>');
    contacts.forEach((contact, index) => {
      if (contact.dpiFilePath) {
        const filePath = path.basename(contact.dpiFilePath);
        res.write(`<p>${index + 1}. ${contact.nombre} - <a href="/download/${filePath}" download>Descargar DPI</a></p>`);
      }
    });
    res.end();
  });
});

// Ruta para descargar archivos
app.get('/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const file = path.join(__dirname, 'uploads', filename);
  res.download(file);
});

app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});
app.get('/uploads.html', (req, res) => {
  fs.readFile('contacts.json', 'utf8', (err, data) => {
    if (err) {
      res.send('No se encontraron archivos subidos.');
      return;
    }
    const contacts = JSON.parse(data);
    res.render('uploads', { contacts: contacts });
  });
});
