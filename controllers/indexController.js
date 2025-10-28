const db = require('../db/queries');
const helper = require('./helpers');

const SECRET = 'admin';

function sayHello(name){
  return `Hello, ${name}`;
}

// function testPrompt(){
//   let data = prompt("What is your prompt?");
//   console.log(data);
// }

exports.getHomepage = async(req, res) => {
  // console.log(process.env);
  console.log(req.url);

  const test = await db.getGames();
  console.log("Test", test);
  res.render('pages/index', {
    title: 'Homepage',
    url: req.url,
    checkUser: helper.checkUser,
    SECRET
    // promptHelper: helper.promptAuthentication,
    // greetUser: sayHello,
    // testPrompt
  });
}