import express from 'express';
import {
	obtenerProyecto,
	obtenerProyectos,
	nuevoProyecto,
	editarProyecto,
	eliminarProyecto,
	buscarColaborador,
	agregarColaborador,
	eliminarColaborador,
} from '../controllers/proyectoController.js';
import checkAuth from '../middleware/checkAuth.js';

const router = express.Router();

// ESTABLECIENDO LAS RUTAS PARA CADA PROCESO
router.get('/', checkAuth, obtenerProyectos);
router.post('/', checkAuth, nuevoProyecto);
// La siguiente ruta es equivalente a las dos de arriba
// router.route('/').get(checkAuth, obtenerProyectos).post(checkAuth, nuevoProyecto);

router.route('/:id').get(checkAuth, obtenerProyecto).put(checkAuth, editarProyecto).delete(checkAuth, eliminarProyecto);

router.post('/colaboradores', checkAuth, buscarColaborador);
router.post('/colaboradores/:id', checkAuth, agregarColaborador);
router.post('/eliminar-colaborador/:id', checkAuth, eliminarColaborador);

export default router;
