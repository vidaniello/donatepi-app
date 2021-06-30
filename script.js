const scopes = ['payments'];

var authResult = null;

function auth(){
  window.Pi.authenticate(scopes, onIncompletePaymentFound)
  .then(function(_authResult) {
    authResult = _authResult;
    //console.log("Hi there! You're ready to make payments!");
    //window.alert("Hi there! You're ready to make payments!");
    document.getElementById("authButtonId").remove();
    document.getElementById("authId").innerHTML="Welcome "+authResult.user.username+", authentication ok!"/*+", accessToken: "+authResult.accessToken*/;
    
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



function onIncompletePaymentFound(payment) { 
  console.log("Incomplete payment not found: "+payment);
  window.alert("Incomplete payment not found: "+payment);
};




function createPay(){
  window.Pi.createPayment({
  // Amount of π to be paid:
  amount: 5,
  // An explanation of the payment - will be shown to the user:
  memo: "a memo.....", // e.g: "Digital kitten #1234",
  // An arbitrary developer-provided metadata object - for your own usage:
  metadata: { cause:"donation"}, // e.g: { kittenId: 1234 }
}, {
  // Callbacks you need to implement - read more about those in the detailed docs linked below:
  onReadyForServerApproval: function(paymentId) { 
    
    var url = "https://api.minepi.com/payments/";

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "https://api.minepi.com/v2/payments/:"+paymentId+"/approve");

    xhr.setRequestHeader("Authorization", "Key l7o0qh1tls1jazekzey3qnynvuh8rwlewv7z5efgp8fnnluacae0fgyfbk9tjj28");

    xhr.onreadystatechange = function () {
     if (xhr.readyState === 4) {
      window.alert(xhr.status);
      window.alert(xhr.responseText);
     }
    };

    xhr.send();
    
    //window.alert("paymentId: "+paymentId);
  },
  onReadyForServerCompletion: function(paymentId, txid) { 
    window.alert("onReadyForServerCompletion");
  },
  onCancel: function(paymentId) {
    window.alert("onCancel");
  },
  onError: function(error, payment) { 
    window.alert("onError");
  },
});
}

