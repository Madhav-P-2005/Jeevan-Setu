# JeevanSetu Backend 

# Installation Setup :- 

1. Clone the repository 
2. Navigate to the project directory 
3. Install dependencies using npm install 
4. Set up environment variables 
5. Start the server using npm start 


# Dependencies 

Core server: express

Database: mongoose

Environment vars: dotenv

Security: helmet, cors

Logging: morgan

Dev tools: nodemon (dev only)


npm install express mongoose dotenv cors body-parser jsonwebtoken bcryptjs nodemailer axios dotenv



package name: (jeevansetu-backend) jeevansetu-package
version: (1.0.0)                                                                                                          
description: "JeevanSetu - Our Minor College Project(FSWD)"
entry point: (index.js) server.js                                                                                         
test command:                                                                                                             
git repository:                                                                                                           
keywords: blood-donation,healthcare , emergency, nodejs , expressjs, Full stack web developement
author: Madhav P madhavp2023@gmail.com
license: (ISC) (MIT)
type: (commonjs)                                                                                                          
About to write to E:\JeevanSetu – Real-Time Blood & Plasma Donor App\jeevansetu-backend\package.json:

npm init :- 


{
  "name": "jeevansetu-package",
  "version": "1.0.0",
  "description": "\"JeevanSetu - Our Minor College Project(FSWD)\"",
  "main": "server.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [
    "blood-donation",
    "healthcare",
    "emergency",
    "nodejs",
    "expressjs",
    "Full",
    "stack",
    "web",
    "developement"
  ],
  "author": "Madhav P madhavp2023@gmail.com",
  "license": "(MIT)",
  "type": "commonjs"
}


Is this OK? (yes) yes



express@4 - Web framework (you chose stable version - smart!)
mongoose - MongoDB object modeling
dotenv - Environment variables management
cors - Cross-origin resource sharing (for frontend-backend communication)
helmet - Security middleware
morgan - HTTP request logger


npm install -D nodemon :- Why nodemon? It automatically restarts your server when you make changes - huge time saver during development!




npm install bcryptjs jsonwebtoken express-validator

Install cookie parser: run in backend folder:
npm i cookie-parser