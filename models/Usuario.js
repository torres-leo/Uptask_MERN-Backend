import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const usuarioSchema = mongoose.Schema(
	{
		nombre: {
			type: String,
			required: true,
			trim: true,
		},
		password: {
			type: String,
			required: true,
			trim: true,
		},
		email: {
			type: String,
			required: true,
			trim: true,
			unique: true,
		},
		token: {
			type: String,
		},
		confirmado: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: true }
);

// Haciendo hash al password
usuarioSchema.pre('save', async function (next) {
	// Evitando hacer hash al password en caso que el usuario no haya modificado su password
	if (!this.isModified('password')) {
		next();
	}
	// realizando el hash
	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);
});

usuarioSchema.methods.comprobarPassword = async function (passwordFormulario) {
	return await bcrypt.compare(passwordFormulario, this.password);
};

const Usuario = mongoose.model('Usuario', usuarioSchema);

export default Usuario;
