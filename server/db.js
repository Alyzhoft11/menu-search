const firebase = require('firebase');
require('firebase/firestore');

firebase.initializeApp({
    apiKey: 'AIzaSyAlWk7qmpwHJrDCybr71lB4VXvPAcmtAR0',
    authDomain: 'menu-items-e9e70.firebaseapp.com',
    projectId: 'menu-items-e9e70'
});

// Initialize Cloud Firestore through Firebase
const db = firebase.firestore();

// Disable deprecated features
db.settings({
  timestampsInSnapshots: true
});

module.exports = db;