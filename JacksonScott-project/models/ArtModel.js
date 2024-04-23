//Import the mongoose module
import pkg from 'mongoose';

//mongoose modules -- you will need to add type": "module" to your package.json
const { Schema, model} = pkg;

//Define the Schema for a citizen
const artSchema = Schema({
    name: String,
    artist: String,
    artistId : Schema.Types.ObjectId,
    year: String,
    category: String,
    medium: String,
    description: String,
    image: String,
    reviews: [{name :String, like:Boolean, review:String,id :Schema.Types.ObjectId}]
});

//Export the default so it can be imported
export default model("art", artSchema);