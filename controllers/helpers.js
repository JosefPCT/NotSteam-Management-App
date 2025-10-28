// Helper function to capitalize the first letter of a string
// Pass as an object to a view to use inside a view (.ejs) file
exports.capitalizeFirstLetter = (string) => {
  if(!string) return "";
  return string.charAt(0).toUpperCase() + string.slice(1);
}

exports.checkUser = (input) => {
  const SECRET = 'admin';
  if(input  === SECRET){
    return true;
  } else {
    return false;
  }
}