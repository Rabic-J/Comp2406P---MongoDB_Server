// Change the host to localhost if you are running the server on your
// own computer.
let host = ["localhost", "YOUR_OPENSTACK_IP"];


//join work shop
function join(value){
    if(value===true) console.log("joining workshop"); 
    else console.log("leaving workshop");

    let id = document.getElementById("id").textContent;
    let hostId = document.getElementById("hostId").textContent
    let name = document.getElementById("name").textContent
    let items = { 'join': value, 'shop':id, 'name':name, 'host':hostId};
    console.log(items)

    fetch(`http://${host[0]}:3000/join`, {
        method: 'PUT', 
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(items)
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
        location.reload()
    })
    // Catch any errors that might happen, and display a message.
    .catch((error) => console.log(error));
    
}

//reveiw art work
function review(){  
    console.log("Submit review");
    let text = document.getElementById("text").value;
    let select = document.getElementById("select").value;
    let id = document.getElementById("id").textContent;
    let name = document.getElementById("name").textContent;
    let like = true
    if(select!=="like") like = false

    let data = { 'like' : like, 'review': text, 'id':id, 'name': name}; 
    fetch(`http://${host[0]}:3000/review`, {
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
        location.reload()
    })
    // Catch any errors that might happen, and display a message.
    .catch((error) => console.log(error));
    
}