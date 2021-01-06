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

const getThreeWords = (arr, n) => {
  var result = new Array(n),
      len = arr.length,
      taken = new Array(len);
  if (n > len)
      throw new RangeError("getRandom: more elements taken than available");
  while (n--) {
      var x = Math.floor(Math.random() * len);
      result[n] = arr[x in taken ? taken[x] : x];
      taken[x] = --len in taken ? taken[len] : len;
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

  const writeDoc = await admin.firestore().collection('rooms').doc(roomcode).set(
    {
      'participants': [data.name], 
      'leader': data.name,
      'currentPainter': "",
      'isStarted': false,
      'messages': [], 
      'paintBrushes': [],
      'points': "clear",
      'brushColor': 4278190080,
      'brushSize': 10
    }
  );

  return roomcode;
});

exports.deleteRoom = functions.firestore.document('rooms/{docId}').onUpdate(async (change, context) => {
  if (change.after.data().participants.length === 0) {
    let roomcode = context.params.docId;
    const deleteDoc = await admin.firestore().collection('rooms').doc(roomcode).delete();
  }
});

exports.getWordChoices = functions.https.onCall(async (data, context) => {

  let wordChoices = [];

  const doc = await admin.firestore().collection('words').doc('wordList').get();
  const wordList = doc.data().words;

  wordChoices = getThreeWords(wordList, 3);

  return wordChoices;
});