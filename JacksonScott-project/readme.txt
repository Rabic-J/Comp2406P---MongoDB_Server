Welcome to the Bedrock rolodex web app.

How to setup and run the application:
1. npm install
2. Make sure the mongo server is running.  CMD on OpenStack that will confirm if 
Mongo service is running.  You should see a process with mongod be displayed.
ps -aux | grep mongod
3. Install the data for the web app.
node database-initializer.js
4. node server.js

On the web browser:
http://localhost:3000/
or
http://localhost:3000/home

They both load the same page.  You can see how that is done in the server.js file.
