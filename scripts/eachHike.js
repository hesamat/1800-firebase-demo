async function displayHikeInfo() {
    let params = new URL( window.location.href ); //get URL of search bar
    let ID = params.searchParams.get( "docID" ); //get value for key "id"

    // doublecheck: is your collection called "Reviews" or "reviews"?
    // spelling matters
    try {
        const doc = await db.collection("hikes").doc(ID).get();
        thisHike = doc.data();
        hikeCode = thisHike.code;
        hikeName = doc.data().name;
        
        // only populate title, and image
        document.getElementById("hikeName").innerHTML = hikeName;
        let imgEvent = document.querySelector(".hike-img");
        imgEvent.src = "../images/" + hikeCode + ".jpg";
    } catch (error) {
        console.error("Error getting hike information:", error);
    }
}
displayHikeInfo();

function saveHikeDocumentIDAndRedirect(){
    let params = new URL(window.location.href) //get the url from the search bar
    let ID = params.searchParams.get("docID");
    localStorage.setItem('hikeDocID', ID);
    window.location.href = 'review.html';
}

async function populateReviews() {
    let hikeCardTemplate = document.getElementById("reviewCardTemplate");
    let hikeCardGroup = document.getElementById("reviewCardGroup");

    let params = new URL(window.location.href); // Get the URL from the search bar
    let hikeID = params.searchParams.get("docID");

    try {
        // Double-check: is your collection called "Reviews" or "reviews"?
        const allReviews = await db.collection("reviews")
            .where("hikeDocID", "==", hikeID)
            .get();
        
        reviews = allReviews.docs;
        reviews.forEach((doc) => {
            var title = doc.data().title;
            var level = doc.data().level;
            var season = doc.data().season;
            var description = doc.data().description;
            var flooded = doc.data().flooded;
            var scrambled = doc.data().scrambled;
            var time = doc.data().timestamp.toDate();
            var rating = doc.data().rating; // Get the rating value

            let reviewCard = hikeCardTemplate.content.cloneNode(true);
            reviewCard.querySelector(".title").innerHTML = title;
            reviewCard.querySelector(".time").innerHTML = new Date(
                time
            ).toLocaleString();
            reviewCard.querySelector(".level").innerHTML = `Level: ${level}`;
            reviewCard.querySelector(".season").innerHTML = `Season: ${season}`;
            reviewCard.querySelector(".scrambled").innerHTML = `Scrambled: ${scrambled}`;
            reviewCard.querySelector(".flooded").innerHTML = `Flooded: ${flooded}`;
            reviewCard.querySelector(".description").innerHTML = `Description: ${description}`;

            // Populate the star rating based on the rating value
            
            // Initialize an empty string to store the star rating HTML
            let starRating = "";
            // This loop runs from i=0 to i<rating, where 'rating' is a variable holding the rating value.
            for (let i = 0; i < rating; i++) {
                starRating += '<span class="material-icons">star</span>';
            }
            // After the first loop, this second loop runs from i=rating to i<5.
            for (let i = rating; i < 5; i++) {
                starRating += '<span class="material-icons">star_outline</span>';
            }
            reviewCard.querySelector(".star-rating").innerHTML = starRating;

            hikeCardGroup.appendChild(reviewCard);
        });
    } catch (error) {
        console.error("Error getting reviews:", error);
    }
}

populateReviews();