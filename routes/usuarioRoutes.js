import express from 'express';
import {
	registrarUsuario,
	autenticar,
	confirmar,
	olvidePassword,
	comprobarToken,
	nuevoPassword,
	perfil,
} from '../controllers/usuarioController.js';
import checkAuth from '../middleware/checkAuth.js';

const router = express.Router();

// Autenticacion, registro y confirmacion de usuarios
router.post('/', registrarUsuario); //crea un nuevo usuario
router.post('/login', autenticar);
router.get('/confirmar/:token', confirmar);
router.post('/olvide-password', olvidePassword);

// router.get('/olvide-password/:token', comprobarToken);
// router.post('/olvide-password/:token', nuevoPassword);
router.route('/olvide-password/:token').get(comprobarToken).post(nuevoPassword);

router.get('/perfil', checkAuth, perfil);

export default router;
