const admin = require('firebase-admin');
const serviceAccount = require('./my-project-1523693285732-firebase-adminsdk-f7ilt-e82c28b1eb.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

admin
  .firestore()
  .collection('discord-oauth')
  .doc(process.argv[2])
  .get()
  .then((snapshot) => {
    const user = snapshot.data();
    return admin.app().auth().createCustomToken(user.uid);
  })
  .then((token) => {
    console.log(`https://party-rank.web.app/discord-oauth?token=${token}`);
  });
