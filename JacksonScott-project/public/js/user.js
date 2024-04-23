// Change the host to localhost if you are running the server on your
// own computer.
let host = ["localhost", "YOUR_OPENSTACK_IP"];

window.addEventListener('load', () => { 

    const delButtons = document.querySelectorAll('.deleteButton');

    delButtons.forEach(delButton => {
        delButton.addEventListener('click',  unfollow);
    })

});

//search for querery
function search(){
    console.log("searching");
    let search = document.getElementById("search").value;
    let searchtype = search.split("?")[0];
    let searchtext = search.split("?")[1];
    let url = `http://${host[0]}:3000/results?type=`+searchtype+`&text=`+searchtext+`&page=1`
    location.href=url
}

//upload new artwork
function uploadArt(){
    location.href=`http://${host[0]}:3000/uploadArt`
}

//upload new work shop
function uploadShop(){
    location.href=`http://${host[0]}:3000/uploadShop`
}

//clears notifcations 
function clean(){  
    console.log("Clear")
    let  user = document.getElementById("id").textContent
    let data = {'user':user};
    fetch(`http://${host[0]}:3000/clear`, {
        method: 'PUT', 
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
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
        let shop = JSON.parse(response)
        location. reload()
    })
    // Catch any errors that might happen, and display a message.
    .catch((error) => console.log(error));
    
}

//unfollows selected
function unfollow(){  
    console.log("Unfollowing");
    let user = this.id

    let data = { 'follow' : false, 'user':user}; 
    fetch(`http://${host[0]}:3000/follow`, {
        method: 'PUT', 
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
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
        let res = JSON.parse(response)
        location. reload()
    })
    // Catch any errors that might happen, and display a message.
    .catch((error) => console.log(error));
}

//changes profile type
function swap(item){  
    if(item) console.log("becoming artist");
    else console.log("becoming patron");

    let swap = { 'artist' : item}; 
    fetch(`http://${host[0]}:3000/switch`, {
        method: 'PUT', 
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(swap)
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
        let shop = JSON.parse(response)
        location.reload()
    })
    // Catch any errors that might happen, and display a message.
    .catch((error) => console.log(error));
    
}

