import mongoose from 'mongoose';

const conectarDB = async () => {
	try {
		// estableciendo la conexion desde mongoDB mediante las variables de entorno
		const connection = await mongoose.connect(process.env.MONGO_URI, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});

		const url = `${connection.connection.host}:${connection.connection.port}`;
		console.log(`Mongo conectado en: ${url}`);
	} catch (error) {
		console.log(`error: ${error.message}`);
		process.exit(1);
	}
};

export default conectarDB;
