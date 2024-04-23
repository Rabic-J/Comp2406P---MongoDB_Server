//Import the mongoose module.
import pkg from 'mongoose';
import fs from 'fs';

const { connect, connection } = pkg;
let gallery = JSON.parse(fs.readFileSync('gallery.json').toString());
//Import the Citzen and User models.
import User from './models/UserModel.js';
import Art from './models/ArtModel.js';
import Work from './models/WorkshopModel.js';

//Create an async function to load the data.
//Other mongoose calls that return promises(connect, dropdatabase, create) 
//inside the async function can use an await.
const loadData = async () => {
	
	//Connect to the mongo database.
  	await connect('mongodb://localhost:27017/demo');

	//Remove database and start anew.
	await connection.dropDatabase();



		let names= [];

		gallery.forEach(obj=>{
			let username = obj.artist;
			if(!names.includes(username)){
				names.push(username)
				let artist = new User({
					username:username,
					password:"password",
					artist:true
		
				})
		
				artist.save(function(err){
					if(err)throw err;
					let art = new Art({
						name:obj.name,
						artist:obj.artist,
						artistId:artist._id,
						year:obj.year,
						category:obj.category,
						medium:obj.medium,
						description:obj.description,
						image:obj.image
					})
					art.save(function(err,result){
						if(err) throw err;
						artist.art.push({name :art.name,id :art._id});
						artist.save(function(err,result){
							if(err) throw err;
							console.log(result);
							console.log("Loaded Database");
						})
					})
				})
			}

			
		})

		await User.create(artist);
		await Art.create(art);
		await Work.create(shop);

}

//Call to load the data.
//Once the loadData Promise returns it will close the database
//connection.  Any errors from connect, dropDatabase or create
//will be caught in the catch statement.
loadData()
  .then((result) => {
	console.log("Closing database connection.");
 	connection.close();
  })
  .catch(err => console.log(err));