// Change the host to localhost if you are running the server on your
// own computer.
let host = ["localhost", "YOUR_OPENSTACK_IP"];

window.addEventListener('load', () => {

    document.getElementById("addArt").addEventListener("click", addArt);

});

function addArt(){  
    console.log("Adding a new Artwork");
    
    let artist = document.getElementById("artist").textContent;
    let artistId = document.getElementById("id").textContent;

    let name = document.getElementById("name").value;
    let year = document.getElementById("year").value;
    let category = document.getElementById("category").value;
    let medium = document.getElementById("medium").value;
    let description = document.getElementById("description").value;
    let image = document.getElementById("link").value;
    console.log(artistId);

    let newArt = { 'name' : name, 'artist' : artist, 'artistId' : artistId, 'year': year,'category': category,'medium': medium,'description': description,'image': image,}; 
    fetch(`http://${host[0]}:3000/uploadArt`, {
        method: 'POST', 
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newArt)
    })
    // fetch() returns a promise. When we have received a response from the server,
    // the promise's `then()` handler is called with the response.
    .then((response) => {
        // Our handler throws an error if the request did not succeed.
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        // Otherwise (if the response succeeded), our handler fetches the response
        // as text by calling response.text(), and immediately returns the promise
        // returned by `response.text()`.
        return response.text();
    })
    // When response.text() has succeeded, the `then()` handler is called with
    // the text, and we parse the response to retrieve the id and redirect
    // to another URL.
    .then((response) => {
        let art = JSON.parse(response)
        if(art.name===""){
            alert("Invalid name");
            location.reload();
        } else{
            location.href=`http://${host[0]}:3000/artworks/${art._id}`;
        } 
    })
    // Catch any errors that might happen, and display a message.
    .catch((error) => console.log(error));
    
}