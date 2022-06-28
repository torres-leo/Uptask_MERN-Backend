import mongoose from 'mongoose';
import Proyecto from '../models/Proyecto.js';
import Usuario from '../models/Usuario.js';

const obtenerProyectos = async (req, res) => {
	const proyectos = await Proyecto.find({
		$or: [{ colaboradores: { $in: req.usuario } }, { creador: { $in: req.usuario } }],
	}).select('-tareas');
	res.json(proyectos);
};

const nuevoProyecto = async (req, res) => {
	const proyecto = new Proyecto(req.body);
	proyecto.creador = req.usuario._id;

	try {
		const proyectoAlmacenado = await proyecto.save();
		res.json(proyectoAlmacenado);
	} catch (error) {
		console.log(error);
	}
};

const obtenerProyecto = async (req, res) => {
	const { id } = req.params;

	// Verificando que sea un ID valido
	const validId = mongoose.Types.ObjectId.isValid(id);

	if (!validId) {
		const error = new Error('Proyecto no encontrado');
		return res.status(404).json({ msg: error.message });
	}

	// Obteniendo el proyecto completo junto con sus tareas
	const proyecto = await Proyecto.findById(id)
		.populate({ path: 'tareas', populate: { path: 'completado', select: 'nombre email' } })
		.populate('colaboradores', 'nombre email');
	// Verificando que ese ID exista
	if (!proyecto) {
		const error = new Error('Proyecto no encontrado');
		return res.status(404).json({ msg: error.message });
	}

	// Verificando que el ID del proyecto que se pasa, fue creado por el mismo usuario que esta buscando y solo se muestre a los colaboradores
	if (
		proyecto.creador.toString() !== req.usuario._id.toString() &&
		!proyecto.colaboradores.some((colaborador) => colaborador._id.toString() === req.usuario._id.toString())
	) {
		const error = new Error('Acción no válida');
		return res.status(401).json({ msg: error.message });
	}

	// Obteniendo las tareas del proyectos al mismo tiempo
	// const tareas = await Tarea.find().where('proyecto').equals(proyecto._id);
	// res.json({proyecto, tareas});
	res.json(proyecto);
};

const editarProyecto = async (req, res) => {
	const { id } = req.params;

	// Verificando que sea un ID valido
	const validId = mongoose.Types.ObjectId.isValid(id);
	if (!validId) {
		const error = new Error('Proyecto no encontrado');
		return res.status(404).json({ msg: error.message });
	}

	const proyecto = await Proyecto.findById(id);
	// Verificando que ese ID exista
	if (!proyecto) {
		const error = new Error('No encontrado');
		return res.status(404).json({ msg: error.message });
	}

	// Verificando que el ID del proyecto que se parseFloat, fue creado por el mismo usuario que esta buscando
	if (proyecto.creador.toString() !== req.usuario._id.toString()) {
		const error = new Error('Acción no válida');
		return res.status(401).json({ msg: error.message });
	}

	proyecto.nombre = req.body.nombre || proyecto.nombre;
	proyecto.descripcion = req.body.descripcion || proyecto.descripcion;
	proyecto.fechaEntrega = req.body.fechaEntrega || proyecto.fechaEntrega;
	proyecto.cliente = req.body.cliente || proyecto.cliente;

	try {
		const proyectoActualizado = await proyecto.save();
		return res.json(proyectoActualizado);
	} catch (error) {
		console.log(error);
	}
};

const eliminarProyecto = async (req, res) => {
	const { id } = req.params;

	// Verificando que sea un ID valido
	const validId = mongoose.Types.ObjectId.isValid(id);
	if (!validId) {
		const error = new Error('Proyecto no encontrado');
		return res.status(404).json({ msg: error.message });
	}

	const proyecto = await Proyecto.findById(id);
	// Verificando que ese ID exista
	if (!proyecto) {
		const error = new Error('No encontrado');
		return res.status(404).json({ msg: error.message });
	}

	// Verificando que el ID del proyecto que se parseFloat, fue creado por el mismo usuario que esta buscando
	if (proyecto.creador.toString() !== req.usuario._id.toString()) {
		const error = new Error('Acción no válida');
		return res.status(401).json({ msg: error.message });
	}

	try {
		await proyecto.deleteOne();
		res.json({ msg: 'Proyecto Eliminado' });
	} catch (error) {
		console.log(error);
	}
};

const buscarColaborador = async (req, res) => {
	const { email } = req.body;

	const usuario = await Usuario.findOne({ email }).select('nombre _id email');

	if (!usuario) {
		const error = new Error('Usuario no encontrado. Verifica que el dato sea correcto');
		return res.status(404).json({ msg: error.message });
	}

	res.json(usuario);
};

const agregarColaborador = async (req, res) => {
	const proyecto = await Proyecto.findById(req.params.id);

	if (!proyecto) {
		const error = new Error('Proyecto no encontrado');
		return res.status(404).json({ msg: error.message });
	}

	if (proyecto.creador.toString() !== req.usuario._id.toString()) {
		const error = new Error('Accion no válida');
		return res.status(401).json({ msg: error.message });
	}

	const { email } = req.body;

	const usuario = await Usuario.findOne({ email }).select('nombre _id email');

	if (!usuario) {
		const error = new Error('Usuario no encontrado. Verifica que el dato sea correcto');
		return res.status(404).json({ msg: error.message });
	}

	//El colaborador no es el admin del proyecto
	if (proyecto.creador.toString() === usuario._id.toString()) {
		const error = new Error('El creador del Proyecto no puede ser Colaborador');
		return res.status(406).json({ msg: error.message });
	}

	// Revisar que no este ya agregado al proyecto
	if (proyecto.colaboradores.includes(usuario._id)) {
		const error = new Error('El Usuario ya pertenece al Proyecto');
		return res.status(405).json({ msg: error.message });
	}

	// Esta bien, si se puede agregar
	proyecto.colaboradores.push(usuario._id);
	await proyecto.save();
	res.json({ msg: 'Colaborador Agregado Correctamente' });
};

const eliminarColaborador = async (req, res) => {
	const proyecto = await Proyecto.findById(req.params.id);

	if (!proyecto) {
		const error = new Error('Proyecto no encontrado');
		return res.status(404).json({ msg: error.message });
	}

	if (proyecto.creador.toString() !== req.usuario._id.toString()) {
		const error = new Error('Accion no válida');
		return res.status(401).json({ msg: error.message });
	}

	// Esta bien, se puede eliminar
	proyecto.colaboradores.pull(req.body.id);
	await proyecto.save();
	res.json({ msg: 'Colaborador Eliminado' });
};

// Para la siguiente funcion, solo esta habilitada si eres creador del proyecto o colaborador

export {
	obtenerProyecto,
	obtenerProyectos,
	nuevoProyecto,
	editarProyecto,
	eliminarProyecto,
	buscarColaborador,
	agregarColaborador,
	eliminarColaborador,
};
