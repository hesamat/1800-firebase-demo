var currentUser;               //points to the document of the user who is logged in

function populateUserInfo() {
    firebase.auth().onAuthStateChanged(async user => {
        // Check if user is signed in:
        if (user) {
            //go to the correct user document by referencing to the user uid
            currentUser = db.collection("users").doc(user.uid);
            //get the document for current user.
            try {
                const userDoc = await currentUser.get();
                //get the data fields of the user
                let userName = userDoc.data().name;
                let userSchool = userDoc.data().school;
                let userCity = userDoc.data().city;

                //if the data fields are not empty, then write them in to the form.
                if (userName != null) {
                    document.getElementById("nameInput").value = userName;
                }
                if (userSchool != null) {
                    document.getElementById("schoolInput").value = userSchool;
                }
                if (userCity != null) {
                    document.getElementById("cityInput").value = userCity;
                }
            } catch (error) {
                console.error("Error getting user data:", error);
            }
        } else {
            // No user is signed in.
            console.log("No user is signed in");
        }
    });
}

//call the function to run it 
populateUserInfo();

function editUserInfo() {
    //Enable the form fields
    document.getElementById('personalInfoFields').disabled = false;
}

async function saveUserInfo() {
    //get the values from the form fields
    userName = document.getElementById('nameInput').value;       //get the value of the field with id="nameInput"
    userSchool = document.getElementById('schoolInput').value;   //get the value of the field with id="schoolInput"
    userCity = document.getElementById('cityInput').value;       //get the value of the field with id="cityInput"

    try {
        await currentUser.update({
            name: userName,
            school: userSchool,
            city: userCity
        });
        console.log("Document successfully updated!");
    } catch (error) {
        console.error("Error updating document:", error);
    }

    document.getElementById('personalInfoFields').disabled = true;
}

document.getElementById("saveButton").addEventListener("click", saveUserInfo);