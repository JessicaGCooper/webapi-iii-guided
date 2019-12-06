const express = require('express'); // importing a CommonJS module
const helmet = require('helmet'); // <<<<<install the package, import it here

const hubsRouter = require('./hubs/hubs-router.js');

const server = express();

//Middleware

//custom middleware (logger)
function logger(req, res, next) {
  console.log(`${req.method} to ${req.originalUrl}`)
  
  next();//allows the request to continue to the next middleware or route handler
} 

//custom middleware (gatekeeper --> reads a password from the headers and if the password is 'mellon', let it continue, if not send back status code 401 & a message). Use it for the /secret endpoint.
function gatekeeper(req, res, next) {
  const password = req.headers.password;
    //below reads 'if a password exists & the password(not case sensitive) is "mellon" then user logs in, if not, error message returns
    //Luis likes to always check for existance of variable if he is using a .method b/c otherwise it will crash the code if the variable is undefined
    if (password && password.toLowerCase() === "mellon") {
      next();
    } else {
      res.status(401).json({ you: "shall not pass!!" });
    }
  }

//use of middleware 
server.use(helmet());// <<<<<<use helmet here (3rd party middleware) <<<<globally
server.use(express.json()); // built-in middleware
server.use(logger);//custom middleware

//endpoints
//routers
server.use('/api/hubs', checkRole('admin'), hubsRouter);//<<<<<local middleware b/c it only applies to 'api/hubs'

//router endpoint operations
server.get('/', (req, res) => {
  const nameInsert = (req.name) ? ` ${req.name}` : '';

  res.send(`
    <h2>Lambda Hubs API</h2>
    <p>Welcome${nameInsert} to the Lambda Hubs API</p>
    `);
});

server.get('/echo', (req, res) => {
  res.send(req.headers)
})

//shift + alt + u (or down) to copy the selected lines
server.get('/secret', gatekeeper, checkRole('agent'), (req, res) => {
  res.send(req.headers)
})

module.exports = server;


// checkRole('admin'), checkRole('agents')
function checkRole(role) {
  return function(req, res, next){
    if(role && role === req.headers.role){
      next()
    } else {
      res.status(403)//logged in but do not have access rights
      .json({ message: "can't touch this!" })
    }
  };
}

/*
Why do you pass in the function code (no subsequent parenthesis) as opposed to the running function (with parenthesis)?
server.use (middleware) versus server.use (middleware())

BECAUSE IF YOU SEE MIDDLEWARE YOU HAVE TO INVOKE IT'S NOT ACTUALLY MIDDLEWARE IT'S A REGULAR FUNCTION THAT RETURNS MIDDLEWARE AS CHECKROLE DOES ABOVE
*/

// Note: arrow functions don't hoist so order doesn't matter so much