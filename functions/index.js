// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access Cloud Firestore.
const admin = require('firebase-admin');
admin.initializeApp();

const generateRandomString = (length) => {
  let result           = '';
  let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let charactersLength = characters.length;
  for ( let i = 0; i < length; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

exports.createRoom = functions.https.onCall(async (data, context) => {

  let documentList = [];
  let roomcode = "";
  const documents = await admin.firestore().collection('rooms').get();

  for (document of documents.docs) {
    console.log(document.id);
    documentList.push(document.id)
  }

  while (roomcode === "" || documentList.includes(roomcode)) {
    roomcode = generateRandomString(6);
  }

  const writeDoc = await admin.firestore().collection('rooms').doc(roomcode).set({'participants': [data.name], 'messages': []});

  return roomcode;
});

exports.deleteRoom = functions.firestore.document('rooms/{docId}').onUpdate(async (change, context) => {
  if (change.after.data().participants.length === 0) {
    let roomcode = context.params.docId;
    const subCollection = await admin.firestore().collection('rooms').doc(roomcode).collection('paintBrushes').get();
    for (doc of subCollection.docs) {
       console.log(doc.id);
       admin.firestore().collection('rooms').doc(roomcode).collection('paintBrushes').doc(doc.id).delete();
    }
    const deleteDoc = await admin.firestore().collection('rooms').doc(roomcode).delete();
  }
});

exports.clearBrushes = functions.https.onCall(async (data, context) => {

  const subCollection = await admin.firestore().collection('rooms').doc(data.roomcode).collection('paintBrushes').get();
  let deletePromise= [];
  for (doc of subCollection.docs) {
    console.log(doc.id);
    deletePromise.push(admin.firestore().collection('rooms').doc(data.roomcode).collection('paintBrushes').doc(doc.id).delete());
 }

  return Promise.all(deletePromise);
});