//Import the mongoose module
import pkg from 'mongoose';

//mongoose modules -- you will need to add type": "module" to your package.json
const { Schema, model} = pkg;

//Define the Schema for a citizen
const userSchema = Schema({
    username: String,
    password: String,
    artist: Boolean,
    art : [{name :String,id :Schema.Types.ObjectId}],
    reviews: [{name :String, like:Boolean, review:String,id :Schema.Types.ObjectId}],
    hosting : [{name :String,id :Schema.Types.ObjectId}],
    workshops : [{name :String,id :Schema.Types.ObjectId}],
    notification : [String],
    followers : [{name :String,id :Schema.Types.ObjectId}],
    following : [{name :String,id :Schema.Types.ObjectId}]
});

//Export the default so it can be imported
export default model("users", userSchema);