# Express_health_detection_website

## Environment introduction
* Runtime Environment：Node.JS
* Web Framework：Express
* Template Engine：Pug(aka Jade)
* Cloud Platform：Heroku
* Database：MongoDB


## Features
This website is based on the Express framework and uses the MongoDB database to store users' data. The purpose of the website is to provide users with access to the data detected from your sensors and is deployed on the heroku platform. The following are the features of this website:

* A simple and easy GUI
* Register, log in and log out
* Home page
* Display available sensors 
* Create new sensor
* Display user's records in table
* Display the user's data in charts
* API installation
* Help page
* User's profile

## Example
you can visit [here](https://health-detection.herokuapp.com) to see what it looks like


## Set-up(local environment)
Step0. Download NodeJS、Git

Step1. Install the code zip or run the commnad in your terminal as following:
```
git clone https://github.com/Chen-yu-hsieh/Express_health_detection_website.git
```
Step2. Navigate into the new repo
```
cd C:/<your>/<location>
```

Step3. Install dependecies
```
npm install
```

Step4. Visit [MongoDB](https://www.mongodb.com/atlas/database)to create a new account and cluster. If you have some problems due to the installation, please visit[here](https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/mongoose#setting_up_the_mongodb_database)

Step5. Navigate database your built above and follow this: overview > connect > conect your application > copy your URL and open app.js in this repo> find the line that sets the MongoDB connection variable. It will look something like this:
```
var db_url = 'mongodb+srv://<Your username>:<Your password>@<cluster name>.kvowd.mongodb.net/?retryWrites=true&w=majority'
```
Replace the line with your url you copied above.

Step6. Start the server
```
npm start
```
or start by nodemon
```
npm run devstart
```

Step7. Enter http://localhost:3000/ to check

## Deploy to heroku

Step0. Install [heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) and create a new account

Step1. Open terminal and run the following command to check heroku installation 
```
heroku help
```
Pass Step2 if you are good with Step1

Step2. Control panel > System > Advanced system setting > Environment Variable > System Variable > Click PATH >  Edit > Add > Choose the location of Heroku CLI/bin > OK. Go back to Step1 to recheck.

Step3. Log in heroku
```
heroku login
```

Step4. Navigate to your repo to deploy
```
cd C:/<your>/<repo>
```

Step5. Create heroku app
```
heroku create <app name>
```

Step6. Config environment variable
```
heroku config:set NODE_ENV='production'
heroku config:set MONGODB_URL='mongodb+srv://<Your username>:<Your password>@<cluster name>.kvowd.mongodb.net/?retryWrites=true&w=majority'
```

Step7. push your repo to heroku branch
```
git push heroku
```

Step8. Open app to check
```
heroku open
```
