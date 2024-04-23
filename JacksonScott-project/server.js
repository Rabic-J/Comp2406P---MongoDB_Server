import express from 'express';

const app = express();

import session from 'express-session';
import { default as connectMongoDBSession} from 'connect-mongodb-session';

const MongoDBStore = connectMongoDBSession(session);

//Defining the location of the sessions data in the database.
var store = new MongoDBStore({
  uri: 'mongodb://localhost:27017/demo',
  collection: 'sessions'
});

//Setting up the express sessions to be stored in the database.
app.use(session(
    { 
      secret: 'top secret key',
      resave: true,
      saveUninitialized: false,
      store: store 
    })
);

//Request logger.
import logger from 'morgan'; 

import pkg from 'mongoose';
const { connect, Types } = pkg;

app.use(express.urlencoded({extended: true}));

//Import models.
import User from './models/UserModel.js';
import Artwork from './models/ArtModel.js'
import Workshop from './models/WorkshopModel.js';

//process.env.PORT will see if there is a specific port set in the environment.
 const PORT = process.env.PORT || 3000;

 //Root directory for javascript files.
const ROOT_DIR_JS = '/public/js';

// Change the host to localhost if you are running the server on your
// own computer.
let host = ["localhost", "YOUR_OPENSTACK_IP"];

//Logging our connections to the express servers.
app.use(logger('dev'));

//Static server will check the following directory.
//Needed for the javascript files.
app.use(express.static("." + ROOT_DIR_JS));

//Convert any JSON stringified strings in a POST request to JSON.
app.use(express.json());

//Setting pug as our template engine.
app.set('views', './views');
app.set('view engine', 'pug');

//if logged in take to profile else login page
app.get(['/', '/login'], (req, res) => {
    if(req.session.loggedin) {
        res.redirect(`http://${host[0]}:3000/profile`);
	}else{
        res.render('pages/login', { session: req.session });
    }
});

// Search the database to match the username and password .
app.post("/login", async (req, res) => {

	let username = req.body.username;
	let password = req.body.password;

    try {
        const searchResult = await User.findOne({ username: username });
        if(searchResult != null) { 
            if(searchResult.password === password) {
                // If we successfully match the username and password
                // then set the session properties.  We add these properties
                // to the session object.
                req.session.loggedin = true;
                req.session.username = searchResult.username;
                req.session.userid = searchResult._id;
                res.redirect(`http://${host[0]}:3000/profile`);
            } else {
                res.status(401).send("Not authorized. Invalid password.");
            }
        } else {
            res.status(401).send("Not authorized. Invalid password.");
        }
    } catch(err) {
        console.log(err);
        res.status(500).json({ error: "Error logging in."});
    }    

});

// Rendering the registration page.
app.get("/register", (req, res) => {
    if(req.session.loggedin) {
        res.redirect(`http://${host[0]}:3000/profile`);
	}else{
        res.render("pages/register", { session: req.session });
    }
});

// Saving the user registration to the database.
app.post("/register", async (req, res) => {
    let newUser = req.body;
    try{
        const searchResult = await User.findOne({ username: newUser.username});
        if(searchResult == null) {
            console.log("registering: " + JSON.stringify(newUser));
            await User.create(newUser);
            res.status(200).send();
        } else {
            console.log("Send error.");
            res.status(404).json({'error': 'Exists'});
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Error registering" });
    }  

});

// Log the user out of the application.
app.get("/logout", (req, res) => {

    // Set the session loggedin property to false.
	if(req.session.loggedin) {
		req.session.loggedin = false;
	}
	res.redirect(`http://${host[0]}:3000/login`);

});

//results of search  
app.get('/results', async (req, res) => {
    //checks if logged in
    if(req.session.loggedin) {
        let type = req.query.type;
        let text = req.query.text;
        let page = req.query.page*10-10;
        let url = `/results?type=`+type+`&text=`+text+`&page=`;
        
        //searchs db for match artwork
        Artwork.find().where(type).equals(text).limit(10).skip(page).exec(function(err,searchResult){
            if(err) throw err;
            if(searchResult===null){
                console.log('not found');
                res.status(404).send("Unknown resource");
            }else{
                console.log(searchResult);
                res.render('pages/results', { results: searchResult, session: req.session, current:req.query.page, link: url, title: {type:type,text:text}});
            }
        })

	}else{
        res.redirect(`http://${host[0]}:3000/login`);
    }
});

app.get('/artworks', async (req, res) => {
    if(req.session.loggedin) {
        let page = req.query.page*10-10;
        let url = `/artworks?page=`;
        Artwork.find().limit(10).skip(page).exec(function(err,searchResult){
            if(err) throw err;
            if(searchResult===null){
                console.log('not found');
                res.status(404).send("Unknown resource");
            }else{
                console.log(searchResult);
                res.render('pages/artworks', { items: searchResult, session: req.session, current:req.query.page,link: url});
            }
        })




	}else{
        res.redirect(`http://${host[0]}:3000/login`);
    }
});


// gets search page
app.get('/search', (req, res) => {
    //checks if logged in
    if(req.session.loggedin) {
        res.render('pages/search', { session: req.session });
	}else{
        res.redirect(`http://${host[0]}:3000/login`);
    }
});

//clears user notifications
app.put("/review", async (req, res)=>{
    //checks if logged in
    if(req.session.loggedin) {
        let artwork = req.body.id;
        let name = req.body.name;
        let like = req.body.like;
        let text = req.body.review;
        let user = req.session;

        const searchResult = await Artwork.findOne({ _id: artwork });
        let artist = searchResult.artistId;

        //adds review to artwork
        searchResult.reviews.push({name : user.username, like: like, review: text,id :user.userid});
        Artwork.findOneAndUpdate({ _id: artwork },{ reviews: searchResult.reviews},function(err,searchResult){
            if(err) throw err;
            if(searchResult===null){
                console.log('not found');
                res.status(404).send("Unknown resource");
            }else{
                console.log(searchResult);
            }
        })
        
        //adds reviews to users reviews
        const otherResult = await User.findOne({ _id: user.userid });
        otherResult.reviews.push({name : name, like: like, review: text,id :artwork});
        User.findOneAndUpdate({ _id: user.userid },{ reviews: otherResult.reviews},function(err,searchResult){
            if(err) throw err;
            if(searchResult===null){
                console.log('not found');
                res.status(404).send("Unknown resource");
            }else{
                console.log(searchResult);
            }
        })
        
        //adds notication to artist that art have a review
        const note = await User.findOne({ _id: artist });
        note.notification.push(user.username +" left a comment on "+name);
        User.findOneAndUpdate({ _id: user.userid },{notification:note.notification},function(err,searchResult){
            if(err) throw err;
            if(searchResult===null){
                console.log('not found');
                res.status(404).send("Unknown resource");
            }else{
                console.log(searchResult);
            }
        })
        
        res.json(artwork);
	}else{
        res.redirect(`http://${host[0]}:3000/login`);
    }
});

//clears user notifications
app.put("/clear", async (req, res)=>{
    if(req.session.loggedin) {
        let change = req.body.user;
        let changer = req.session.userid
        if(change==changer){
            User.findOneAndUpdate({ _id: change },{ notification:""},function(err,searchResult){
                if(err) throw err
                if(searchResult===null){
                    console.log('not found')
                    res.status(404).send("Unknown resource");
                }else{
                    console.log(searchResult);
                }
            })
        }
        res.json(change);
	}else{
        res.redirect(`http://${host[0]}:3000/login`);
    }
});

//join leave work shop
app.put("/join", async (req, res)=>{
    if(req.session.loggedin) {
        let shopId = req.body.shop;
        let shop = req.body.name;
        let hostId = req.body.host;
        let follower = req.session.userid;
        let join = req.body.join;
        
        const searchResult = await Workshop.findOne({ _id: shopId });
        const host = await User.findOne({ _id: searchResult.artistId });
        const otherResult = await User.findOne({ _id: follower });

        //is user in workshop
        let checkparticipants =[];
        searchResult.participants.forEach(a => {
            checkparticipants.push(a.name);
        })
        let index = checkparticipants.indexOf(req.session.username);
        
        //is workshop in user
        let checkjoined =[];
        otherResult.workshops.forEach(a => {
            checkjoined.push(a.name);
        })
        let otherIndex = checkjoined.indexOf(shop);

        //joins workshop
        if(join){
            if(index==-1){
                searchResult.participants.push({name :req.session.username,id : follower})
                host.notification.push(req.session.username+" has joined your "+shop+"Workshop")
                otherResult.workshops.push({name :shop,id : shopId})
            }

        //leaves workshop
        }else{
            if(index>-1){
                searchResult.participants.splice(index, 1);
                host.notification.push(req.session.username+" has left your "+shop+"Workshop")
                otherResult.workshops.splice(otherIndex, 1);
            }
        }

        //updates workshop
        Workshop.findOneAndUpdate({ _id: shopId },{participants: searchResult.participants},function(err,searchResult){
            if(err) throw err;
            if(searchResult===null){
                console.log('not found');
                res.status(404).send("Unknown resource");
            }else{
                console.log(searchResult);
            } 
        })

        //updates users
        User.findOneAndUpdate({ _id: follower },{workshops: otherResult.workshops},function(err,searchResult){
            if(err) throw err;
            if(searchResult===null){
                console.log('not found');
                res.status(404).send("Unknown resource");
            }else{
                console.log(searchResult);
            }
        })

        //notifies workshop host
        User.findOneAndUpdate({ _id: searchResult.artistId },{notification:host.notification},function(err,searchResult){
            if(err) throw err;
            if(searchResult===null){
                console.log('not found');
                res.status(404).send("Unknown resource");
            }else{
                console.log(searchResult);
            }
        })
        res.json(4);
	}else{
        res.redirect(`http://${host[0]}:3000/login`);
    }
});

//follow unfollow
app.put("/follow", async (req, res)=>{
    if(req.session.loggedin) {
        let user = req.body.user;
        let follower = req.session.userid;
        let follow = req.body['follow'];
        
        const searchResult = await User.findOne({ _id: user });
        const otherResult = await User.findOne({ _id: follower });

        //are you one of artists follower
        let checkfollowers =[];
        searchResult.followers.forEach(a => {
            checkfollowers.push(a.name);
        })
        let index = checkfollowers.indexOf(req.session.username);
        
        //are you following artist
        let checkfollowing =[];
        otherResult.following.forEach(a => {
            checkfollowing.push(a.name);
        })
        let otherIndex = checkfollowing.indexOf(req.session.username);
        
        //follow
        if(follow){
            if(index==-1){
                searchResult.followers.push({name :req.session.username,id : follower});
                searchResult.notification.push(req.session.username+" is now following you");
                otherResult.following.push({name :searchResult.username,id : user});
            }

        //unfollow
        }else{
            if(index>-1){
                searchResult.followers.splice(index, 1);
                searchResult.notification.push(req.session.username+" is no longer following you");
                otherResult.following.splice(otherIndex, 1);
            }
        }

        //update artist followers and notify them
        User.findOneAndUpdate({ _id: user },{followers: searchResult.followers, notification:searchResult.notification},function(err,searchResult){
            if(err) throw err;
            if(searchResult===null){
                console.log('not found');
                res.status(404).send("Unknown resource");
            }else{
                console.log(searchResult);
            }
        });

        //updated users following arry
        User.findOneAndUpdate({ _id: follower },{following: otherResult.following},function(err,searchResult){
            if(err) throw err;
            if(searchResult===null){
                console.log('not found');
                res.status(404).send("Unknown resource");
            }else{
                console.log(searchResult);
            }
        })
        res.json(user);
	}else{
        res.redirect(`http://${host[0]}:3000/login`);
    }
});

// switch profile between artist and patron
app.put("/switch", async (req, res)=>{
    if(req.session.loggedin) {
        let swap = req.body;
        let obj_id = req.session.userid;
        User.findOneAndUpdate({ _id: obj_id },swap,function(err,searchResult){
            if(err) throw err;
            if(searchResult===null){
                console.log('not found');
                res.status(404).send("Unknown resource");
            }else{
                console.log(searchResult);
            }
        })
        res.json(swap);
	}else{
        res.redirect(`http://${host[0]}:3000/login`);
    }
});

// gets page to upload new workshop
app.get('/uploadShop', (req, res) => {
    if(req.session.loggedin) {
        res.render('pages/uploadShop', { session: req.session });
	}else{
        res.redirect(`http://${host[0]}:3000/login`);
    }
});

// saves new workshop to db
app.post("/uploadShop", async (req, res)=>{
    if(req.session.loggedin) {
        let shop = req.body;

        //cheaks of name is balck or if same name exits in db
        const search = await Workshop.findOne({ name: shop.name});
        if(shop.name!==""&&search==null){
            const searchResult = await Workshop.create(new Workshop(shop));
            let artist = await User.findOne({ _id: req.session.userid });
            artist.hosting.push({name : searchResult.name, id :searchResult._id});

            //adds shop to host
            User.findOneAndUpdate({ _id: searchResult.artistId },{ hosting: artist.hosting},function(err,searchResult){
                if(err) throw err;
                if(searchResult===null){
                    console.log('not found');
                    res.status(404).send("Unknown resource");
                }else{
                    console.log(searchResult); 
                }
            });
            res.json(searchResult);
        }else{
            res.json({name:""});
        }
	}else{
        res.redirect(`http://${host[0]}:3000/login`);
    }
});

// gets page to upload new art work
app.get('/uploadArt', (req, res) => {
    if(req.session.loggedin) {
        res.render('pages/uploadArt', { session: req.session });
	}else{
        res.redirect(`http://${host[0]}:3000/login`);
    }
});

// saves new art work to db
app.post("/uploadArt", async (req, res)=>{
    if(req.session.loggedin) {
        let piece = req.body;

        //cheaks of name is balck or if same name exits in db
        const search = await Artwork.findOne({ name: piece.name});
        if(piece.name!==""&&search==null){
            const searchResult = await Artwork.create(new Artwork(piece));
            let artist = await User.findOne({ _id: req.session.userid });
            artist.art.push({name : searchResult.name, id :searchResult._id})

            //adds art to artist
            User.findOneAndUpdate({ _id: searchResult.artistId },{ art: artist.art},function(err,searchResult){
                if(err) throw err;
                if(searchResult===null){
                    console.log('not found');
                    res.status(404).send("Unknown resource");
                }else{
                    console.log(searchResult);
                }
            });
            res.json(searchResult);
        }else{
            res.json({name:""});
        }
	}else{
        res.redirect(`http://${host[0]}:3000/login`);
    }
});

//gets your profile page
app.get('/profile', async (req, res) => {
    if(req.session.loggedin) {
        let obj_id = req.session.userid;
        const searchResult = await User.findOne({ _id: obj_id });
        res.render('pages/user', { user : searchResult, session: req.session });
    }else{
        res.redirect(`http://${host[0]}:3000/login`);
    }
});

// gets profile page
app.get('/profile/:UserID', async (req, res) => {
    if(req.session.loggedin) { 
        
        //handles nonexistent users
        if(req.params.UserID !== "undefined"&& req.params.UserID!==undefined){
            let obj_id = Types.ObjectId(req.params.UserID);

            //if user and profil have same id takes to user page
            if(req.params.UserID.toString()==req.session.userid.toString()){
                const searchResult = await User.findOne({ _id: obj_id });
                res.render('pages/user', { user : searchResult, session: req.session });

            //takes to artist profile
            }else{
                User.findOne({ _id: obj_id }).exec(function(err,searchResult){
                    if(err) throw err;
                    if(searchResult===null){
                        console.log('not found');
                        res.status(404).send("Unknown resource");
                    }else{
                        console.log(searchResult);
                        res.render('pages/profile', { user : searchResult, session: req.session });
                    }
                })
            }
        }else{
            res.status(404).send("Unknown resource");
        }
 
	}else{
        res.redirect(`http://${host[0]}:3000/login`);
    }
});

// gets artworks page
// app.get('/artworks', async (req, res) => {
//     if(req.session.loggedin) {
// 		const searchResult = await Artwork.find({});
//         res.render('pages/artworks', { items: searchResult, session: req.session });
// 	}else{
//         res.redirect(`http://${host[0]}:3000/login`);
//     }
// });

//Individvidal art page   
app.get('/artworks/:pieceID', async (req, res) => {
    if(req.session.loggedin) {
        //handels nonexistent art pages
        if(req.params.pieceID !== "undefined"&& req.params.pieceID!==undefined){
            let obj_id = Types.ObjectId(req.params.pieceID);

            //takes to art page
                Artwork.findOne({ _id: obj_id }).exec(function(err,searchResult){
                    if(err) throw err;
                    if(searchResult===null){
                        console.log('not found');
                        res.status(404).send("Unknown");
                    }else{
                        console.log(searchResult);
                        res.render('pages/art', { piece : searchResult, session: req.session });
                    }
                })
        }else{
            res.status(404).send("Unknown");
        }
	}else{
        res.redirect(`http://${host[0]}:3000/login`);
    }

});

// gets workshops page
app.get('/workshops', async (req, res) => {
    if(req.session.loggedin) {
		const searchResult = await Workshop.find({});
        res.render('pages/workshops', { items: searchResult, session: req.session });
	}else{
        res.redirect(`http://${host[0]}:3000/login`);
    }
});

//Individvidal workshop page
app.get('/workshops/:shopID', async (req, res) => {
    if(req.session.loggedin) {
        //handels non existent workshops
        if(req.params.shopID !== "undefined"&& req.params.shopID!==undefined){
            let obj_id = Types.ObjectId(req.params.shopID);
                Workshop.findOne({ _id: obj_id }).exec(function(err,searchResult){
                    if(err) throw err;
                    if(searchResult===null){
                        console.log('not found');
                        res.status(404).send("Unknown resource");
                    }else{
                        console.log(searchResult);
                        res.render('pages/shop', { shop : searchResult, session: req.session });
                    }
                })
        }else{
            res.status(404).send("Unknown resource");
        }
	}else{
        res.redirect(`http://${host[0]}:3000/login`);
    }
});

const loadData = async () => {
	//Connect to the mongo database
  	const result = await connect('mongodb://localhost:27017/demo');
    return result;

};

loadData().then(() => {
    app.listen(PORT);
    console.log("Listen on port:", PORT);
  }).catch(err => console.log(err));
