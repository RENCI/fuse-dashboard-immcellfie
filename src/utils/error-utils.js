export const errorUtils = {
  getErrorMessage: error => {
    if (!error) {
      return null;
    }
    else if (error.response) {
      // Client received response
      return error.toString();
    } 
    else if (error.request) {
      // Client never received a response, or request never left
      return error.toString();
    } 
    else {
      // Anything else
      return error.toString();
    }
  }
}