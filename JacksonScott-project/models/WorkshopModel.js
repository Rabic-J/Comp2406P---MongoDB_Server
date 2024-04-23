//Import the mongoose module
import pkg from 'mongoose';

//mongoose modules -- you will need to add type": "module" to your package.json
const { Schema, model} = pkg;

//Define the Schema for a citizen
const workSchema = Schema({
    name: String,
    artist: String,
    artistId: Schema.Types.ObjectId,
    year: String,
    month: String,
    day: String,
    medium: String,
    image: String,
    description: String,
    participants:[{name :String,id :Schema.Types.ObjectId}]

});

//Export the default so it can be imported
export default model("work", workSchema);