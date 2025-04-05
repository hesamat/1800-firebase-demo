//Global variable pointing to the current user's Firestore document
var currentUser;

function getNameFromAuth() {
  firebase.auth().onAuthStateChanged((user) => {
    // Check if a user is signed in:
    if (user) {
      // Do something for the currently logged-in user here:
      console.log(user.uid); //print the uid in the browser console
      console.log(user.displayName); //print the user name in the browser console
      userName = user.displayName;

      //method #1:  insert with JS
      document.getElementById('name-goes-here').innerText = userName;

      //method #2:  insert using jquery
      // $("#name-goes-here").text(userName); //using jquery

      //method #3:  insert using querySelector
      //document.querySelector("#name-goes-here").innerText = userName
    } else {
      // No user is signed in.
      console.log('No user is logged in');
    }
  });
}

// Function to read the quote of the day from the Firestore "quotes" collection
// Input param is the String representing the day of the week, aka, the document name
function readQuote(day) {
  db.collection('quotes')
    .doc(day) //name of the collection and documents should matach excatly with what you have in Firestore
    .onSnapshot(
      (dayDoc) => {
        //arrow notation
        console.log('current document data: ' + dayDoc.data()); //.data() returns data object
        document.getElementById('quote-goes-here').innerHTML =
          dayDoc.data().quote; //using javascript to display the data on the right place

        //Here are other ways to access key-value data fields
        //$('#quote-goes-here').text(dayDoc.data().quote);         //using jquery object dot notation
        //$("#quote-goes-here").text(dayDoc.data()["quote"]);      //using json object indexing
        //document.querySelector("#quote-goes-here").innerHTML = dayDoc.data().quote;
      },
      (error) => {
        console.log('Error calling onSnapshot', error);
      }
    );
}

//------------------------------------------------------------------------------
// Input parameter is a string representing the collection we are reading from
//------------------------------------------------------------------------------
async function displayCardsDynamically(collection) {
  let cardTemplate = document.getElementById('hikeCardTemplate'); // Retrieve the HTML element with the ID "hikeCardTemplate" and store it in the cardTemplate variable.

  try {
    const allHikes = await db.collection(collection).orderBy('hike_time').get(); //the collection called "hikes"
    //var i = 1;  //Optional: if you want to have a unique ID for each hike
    allHikes.forEach(async (doc) => {
      //iterate thru each doc
      var title = doc.data().name; // get value of the "name" key
      var details = doc.data().details; // get value of the "details" key
      var hikeCode = doc.data().code; //get unique ID to each hike to be used for fetching right image
      var hikeLength = doc.data().length; //gets the length field
      let newcard = cardTemplate.content.cloneNode(true); // Clone the HTML template to create a new card (newcard) that will be filled with Firestore data.
      var docID = doc.id;

      //update title and text and image
      newcard.querySelector('.card-title').innerHTML = title;
      newcard.querySelector('.card-length').innerHTML =
        'Length: ' +
        doc.data().length +
        ' km <br>' +
        'Duration: ' +
        doc.data().hike_time +
        'min <br>' +
        'Last updated: ' +
        doc.data().last_updated.toDate().toLocaleDateString();
      newcard.querySelector('.card-text').innerHTML = details;
      newcard.querySelector('.card-image').src = `./images/${hikeCode}.jpg`; //Example: NV01.jpg
      newcard.querySelector('a').href = 'eachHike.html?docID=' + docID;
      newcard.querySelector('i').id = 'save-' + docID; //guaranteed to be unique
      newcard.querySelector('i').onclick = () => updateBookmark(docID);
      
      try {
        const userDoc = await currentUser.get();
        //get the user name
        var bookmarks = userDoc.data().bookmarks;
        if (bookmarks.includes(docID)) {
          document.getElementById('save-' + docID).innerText = 'bookmark';
        }
      } catch (error) {
        console.error("Error getting user document:", error);
      }

      //Optional: give unique ids to all elements for future use
      // newcard.querySelector('.card-title').setAttribute("id", "ctitle" + i);
      // newcard.querySelector('.card-text').setAttribute("id", "ctext" + i);
      // newcard.querySelector('.card-image').setAttribute("id", "cimage" + i);

      //attach to gallery, Example: "hikes-go-here"
      document.getElementById(collection + '-go-here').appendChild(newcard);

      //i++;   //Optional: iterate variable to serve as unique ID
    });
  } catch (error) {
    console.error("Error getting collection:", error);
  }
}

//-----------------------------------------------------------------------------
// This function is called whenever the user clicks on the "bookmark" icon.
// It adds the hike to the "bookmarks" array
// Then it will change the bookmark icon from the hollow to the solid version.
//-----------------------------------------------------------------------------
async function updateBookmark(hikeDocID) {
  try {
    const userDoc = await currentUser.get();
    //get the user name
    var bookmarks = userDoc.data().bookmarks;
    
    if (bookmarks.includes(hikeDocID)) {
      // Remove the bookmark
      await currentUser.update({
        // Use 'arrayRemove' to remove the bookmark ID from the 'bookmarks' array.
        bookmarks: firebase.firestore.FieldValue.arrayRemove(hikeDocID),
      });
      
      console.log('bookmark has been removed for ' + hikeDocID);
      let iconID = 'save-' + hikeDocID;
      //this is to change the icon of the hike that was saved to "hollow"
      document.getElementById(iconID).innerText = 'bookmark_border';
    }
    else {
      // Add the bookmark
      await currentUser.update({
        // Use 'arrayUnion' to add the new bookmark ID to the 'bookmarks' array.
        // This method ensures that the ID is added only if it's not already present, preventing duplicates.
        bookmarks: firebase.firestore.FieldValue.arrayUnion(hikeDocID),
      });
      
      console.log('bookmark has been saved for ' + hikeDocID);
      let iconID = 'save-' + hikeDocID;
      //this is to change the icon of the hike that was saved to "filled"
      document.getElementById(iconID).innerText = 'bookmark';
    }
  } catch (error) {
    console.error("Error updating bookmark:", error);
  }
}

//Function that calls everything needed for the main page
function doAll() {
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      currentUser = db.collection('users').doc(user.uid); //global

      // figure out what day of the week it is today
      const weekday = [
        'sunday',
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
      ];
      const d = new Date();
      let day = weekday[d.getDay()];

      // the following functions are always called when someone is logged in
      readQuote(day);
      getNameFromAuth();
      displayCardsDynamically('hikes');
    } else {
      // No user is signed in.
      console.log('No user is signed in');
      window.location.href = 'login.html';
    }
  });
}
doAll();
