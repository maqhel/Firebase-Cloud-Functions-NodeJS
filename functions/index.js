const functions = require('firebase-functions');
const admin = require('firebase-admin');
const serviceAccount = require('./project_access_firebase.json');
require('dotenv').config()

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: process.env.DB_URL,
});

const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors({ origin: true }));

const db = admin.firestore();

app.get('/', (req, res) => {
	return res.status(200).send('Works');
});

app.post('/api', (req, res) => {
	(async () => {
		try {
			await db.collection('userDetails').doc(`/${Date.now()}/`).create({
				id: Date.now(),
				name: req.body.name,
				phone: req.body.phone,
				address: req.body.address,
			});
			return res
				.status(200)
				.send({ status: 'success', msg: 'saved successfully' });
		} catch (error) {
			console.error(error);
			return res.status(500).send({ status: 'error', msg: 'failed' });
		}
	})();
});

app.get('/api', (req, res) => {
	(async () => {
		try {
			const query = db.collection('userDetails');
			let response = [];
			await query.get().then(data => {
				let docs = data.docs;

				docs.map(doc => {
					const selectedItem = {
						name: doc.data().name,
						phone: doc.data().phone,
						address: doc.data().address,
					};

					response.push(selectedItem);
				});
			});
			return res.status(200).send({ status: 'success', data: response });
		} catch (error) {
			console.error(error);
			return res.status(500).send({ status: 'error', msg: 'failed' });
		}
	})();
});

app.get('/api/:id', (req, res) => {
	(async () => {
		try {
			const reqDoc = db.collection('userDetails').doc(req.params.id);
			let userDetail = await reqDoc.get();
			let response = userDetail.data();
			return res.status(200).send({ status: 'success', data: response });
		} catch (error) {
			console.error(error);
			return res.status(500).send({ status: 'error', msg: 'failed' });
		}
	})();
});

app.put('/api/:id', (req, res) => {
	(async () => {
		try {
			const reqDoc = db.collection('userDetails').doc(req.params.id);
			await reqDoc.update({
				name: req.body.name,
				phone: req.body.phone,
				address: req.body.address,
			});
			return res
				.status(200)
				.send({ status: 'success', msg: 'updated successfully' });
		} catch (error) {
			console.error(error);
			return res.status(500).send({ status: 'error', msg: 'failed' });
		}
	})();
});

app.delete('/api/:id', (req, res) => {
	(async () => {
		try {
			const reqDoc = db.collection('userDetails').doc(req.params.id);
			await reqDoc.delete();
			return res
				.status(200)
				.send({ status: 'success', msg: 'delete successfully' });
		} catch (error) {
			console.error(error);
			return res.status(500).send({ status: 'error', msg: 'failed' });
		}
	})();
});

exports.app = functions.https.onRequest(app);

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
