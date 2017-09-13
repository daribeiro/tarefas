var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var redis = require('redis');

var app = express();

// Cria Cliente Redis
var clienteRedis = redis.createClient();

clienteRedis.on('connect', function () {
    console.log('Servidor Redis Conectado ...');
});

// Configuração do Renderizador de Páginas (EJS)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Captura o caminho '/' na URL
app.get('/', function (req, res) {
    var titulo = 'Novo Contato';

    clienteRedis.lrange('tarefas', 0, -1, function (err, tarefas) {
		clienteRedis.hgetall('contato', function(err, contato){
			res.render('tarefas', {
				titulo: titulo,
				tarefas: tarefas,
				contato: contato
			});
		});
    });
});

app.post('/tarefa/adicionar', function(req, res){
	var tarefa = {};

	tarefas.nome = req.body.nome
	tarefas.telefone = req.body.telefone
	tarefas.email = req.body.email

	clienteRedis.rpush('tarefas', 
			['nome', tarefas.nome, 
			'telefone', tarefas.telefone, 
			'email', tarefas.email],
			function(err, reply){
		if(err){
			console.log(err);
		}
		console.log('Contato Adicionado ...');
		res.redirect('/');
	});
});

app.post('/tarefa/remover', function(req, res){
	var tarefasParaRemover = req.body.tarefas;

	clienteRedis.lrange('tarefas', 0, -1, function(err, tarefas){
		for(var posicao = 0; posicao < tarefas.length; posicao++){
			if(tarefasParaRemover.indexOf(tarefas[posicao]) > -1){
				clienteRedis.lrem('tarefas',0,tarefas[posicao], function(){
					if(err){
						console.log(err);
					}
				});
			}
		}
		res.redirect('/');
	});
});

app.post('/contato/editar', function(req, res){
	var contato = {};

	contato.nome = req.body.nome;
	contato.telefone = req.body.telefone;
	contato.email = req.body.email;

	clienteRedis.hmset('contato', 
	         ['nome', contato.nome,
			  'telefone', contato.telefone, 
			  'email', contato.email], 
			  function(err, reply){
		if(err){
			console.log(err);
		}
		console.log(reply);
		res.redirect('/');
	});e
});

app.listen(7000);
console.log('Servidor Inicializado na Porta 7000 ...',
    'URL: http://localhost:7000/');

module.exports = app;