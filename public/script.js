const scopes = ['payments'];

const donatepiEndpoint = "https://donatepi-server.glitch.me/v1";

var authResult = null;

function onIncompletePaymentFound(payment) { 
  console.log("Incomplete payment not found: "+payment);
  window.alert("Incomplete payment not found: "+payment);
};

function auth(){
  window.Pi.authenticate(scopes, onIncompletePaymentFound)
  .then(function(_authResult) {
    authResult = _authResult;
    //console.log("Hi there! You're ready to make payments!");
    //window.alert("Hi there! You're ready to make payments!");
    document.getElementById("authButtonId").remove();
    document.getElementById("authId").innerHTML="Welcome "+authResult.user.username+", authentication ok!<br/>uid: "+authResult.user.uid+", accessToken: "+authResult.accessToken;
    
    requestUserInfoByAccessToken(_authResult);
    
    let sendButton = document.createElement("input");
    sendButton.type = "button";
    sendButton.value = "Send donation";
    sendButton.addEventListener("click", createPay);
    
    document.getElementById("sendPayments").appendChild(sendButton);
  })
  .catch(function(error) {
    console.error(error);
    window.alert("Authentication failed!"+error);
  });
}


function requestUserInfoByAccessToken(_authResult){
  var xhr = new XMLHttpRequest();
  xhr.open("POST", donatepiEndpoint);

  xhr.setRequestHeader("Content-Type", "application/json");

  xhr.onreadystatechange = function () {
     if (xhr.readyState === 4) {
        //console.log(xhr.status);
        //console.log(xhr.responseText);
       document.getElementById("userInfoByAccessToken").innerHTML=xhr.responseText;
     }};

  var data = '{"operation":"infoByUserAccessToken", "user_access_token":"'+_authResult+'" }';

  xhr.send(data);
}





function createPay(){
  window.Pi.createPayment({
  amount: 2.1,
  memo: "a memo", 
  metadata: {type:"donation"},
}, {
  // Callbacks you need to implement - read more about those in the detailed docs linked below:
  onReadyForServerApproval: function(paymentId) { 
    
    window.alert("paymentId: "+paymentId+" end");
    
    
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "https://api.minepi.com/v2/payments/"+paymentId+"/approve");

    xhr.setRequestHeader("Authorization", "Key put-here-auth-key");

    xhr.onreadystatechange = function () {
     if (xhr.readyState === 4) {
      window.alert(xhr.status);
      window.alert(xhr.responseText);
     }
    };

    xhr.send();
    
    
  },
  onReadyForServerCompletion: function(paymentId, txid) { 
    window.alert("onReadyForServerCompletion");
    
    
  },
  onCancel: function(paymentId) {
    window.alert("onCancel");
  },
  onError: function(error, payment) {
    window.alert("onError: "+error);
    window.alert("onError: "+payment);
  },
});
}

