const admin = require('firebase-admin');
const { nanoid } = require('nanoid');
const serviceAccount = require('./my-project-1523693285732-firebase-adminsdk-f7ilt-e82c28b1eb.json');

const ASSETS_FOLDER = '/var/www/html/assets';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const fileToUploadName = process.argv[3];

admin
  .firestore()
  .collection('discord-oauth')
  .doc(process.argv[2])
  .get()
  .then((snapshot) => {
    const user = snapshot.data();
    return user.uid;
  })
  .then((uid) => {
    console.log(uid);
    const fileId = nanoid(8);
    const extension = fileToUploadName.split('.').at(-1);
    const fileName = `${fileId}.${extension}`;
    const path = `${ASSETS_FOLDER}/${fileName}`;
    const fileUrl = `https://bitvalser.xyz/assets/${fileName}`;
    console.log({ id: fileId, created: new Date().toISOString(), name: fileToUploadName, url: fileUrl, path });
    return admin
      .firestore()
      .collection('cdn')
      .doc(uid)
      .set(
        { [fileId]: { id: fileId, created: new Date().toISOString(), name: fileToUploadName, url: fileUrl, path } },
        { merge: true },
      );
  });
