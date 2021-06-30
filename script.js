const scopes = ['payments'];

var authResult = null;

function auth(){
  window.Pi.authenticate(scopes, onIncompletePaymentFound)
  .then(function(_authResult) {
    authResult = _authResult;
    console.log("Hi there! You're ready to make payments!");
    window.alert("Hi there! You're ready to make payments!");
    document.getElementById("authButtonId").disabled=true;
    document.getElementById("authId").innerHTML="Welcome "+authResult.user.username;
  })
  .catch(function(error) {
    console.error(error);
    window.alert("Authentication failed!"+error);
  });
}



function onIncompletePaymentFound(payment) { 
  console.log("Incomplete payment not found: "+payment);
  window.alert("Incomplete payment not found: "+payment);
};
