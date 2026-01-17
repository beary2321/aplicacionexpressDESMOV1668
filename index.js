//Importamos las librarías requeridas
const express = require('express')
const bodyParser = require('body-parser')
const sqlite3 = require('sqlite3').verbose();

//Documentación en https://expressjs.com/en/starter/hello-world.html
const app = express()

//Creamos un parser de tipo application/json
//Documentación en https://expressjs.com/en/resources/middleware/body-parser.html
const jsonParser = bodyParser.json()


// Abre la base de datos de SQLite
let db = new sqlite3.Database('./base.sqlite3', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Conectado a la base de datos SQLite.');

    db.run(`CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        todo TEXT NOT NULL,
        created_at INTEGER
    )`, (err) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log('Tabla tareas creada o ya existente.');
        }
    });
});

//Creamos un endpoint de login que recibe los datos como json
app.post('/insert', jsonParser, (req, res) => {
  const { todo } = req.body;

  if (!todo) {
    return res.status(400).json({ error: 'Falta el campo todo' });
  }

  const stmt = db.prepare(
    'INSERT INTO todos (todo, created_at) VALUES (?, CURRENT_TIMESTAMP)'
  );

  stmt.run(todo, function (err) {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: 'Error al insertar' });
    }

    res.status(201).json({
      mensaje: 'Tarea guardada correctamente',
      id: this.lastID
    });
  });

  stmt.finalize();


    
  
})





//Creamos un endpoint de login que recibe los datos como json
app.post('/login', jsonParser, function (req, res) {
    //Imprimimos el contenido del body
    console.log(req.body);

    //Enviamos de regreso la respuesta
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ 'status': 'ok' }));
})

//Corremos el servidor en el puerto 3000
const port = process.env.PORT || 3000;


// Para recibir datos de formularios HTML


app.post('/agrega_todo', jsonParser, (req, res) => {
    const { todo } = req.body;

    if (!todo) {
        res.status(400).json({ error: 'Falta el campo "todo"' });
        return;
    }

    const stmt = db.prepare('INSERT INTO todos (todo, created_at) VALUES (?, CURRENT_TIMESTAMP)');
    stmt.run(todo, function(err) {
        if (err) {
            console.error('Error al insertar:', err.message);
            res.status(500).json({ error: 'Error al insertar en la base de datos' });
            return;
        }

        console.log(`Tarea nueva agregada: ${todo}`);

        // Consultamos toda la tabla después de insertar
        db.all('SELECT * FROM todos ORDER BY id', (err, rows) => {
            if (err) {
                console.error('Error al consultar la tabla:', err.message);
                res.status(500).json({ error: 'Error al consultar la base de datos' });
                return;
            }

            // Respuesta JSON con estado HTTP 201
            res.status(201).json({
                status: 201,
                mensaje: 'Tarea nueva agregada correctamente',
                todos: rows
            });
        });

    });
    stmt.finalize();
});

// Endpoint para obtener todas las tareas
app.get('/todos', (req, res) => {
  db.all('SELECT * FROM todos ORDER BY id', (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: 'Error al consultar la base de datos' });
    }

    res.json(rows);
  });
});




app.listen(port, () => {
    console.log(`Aplicación corriendo en http://localhost:${port}`)
})

