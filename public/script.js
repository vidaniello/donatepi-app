// https://github.com/pi-apps/pi-platform-docs
// https://api.testnet.minepi.com
// https://pi-blockchain.net/
// https://dashboard.pi-blockchain.net/

const scopes = ['payments'];

const donatepiEndpoint = "https://donatepi-server.glitch.me";
const requestDonatepiServerStatus_path = "/serverStatus";
const requestOperation_path = "/v1";

var donatepiServerConnection = false;
var authResult = null;


document.addEventListener("DOMContentLoaded", function(){
  
  //Request donatepi-server status
  let xhr = new XMLHttpRequest();
  xhr.open("GET", donatepiEndpoint+requestDonatepiServerStatus_path);
  xhr.onreadystatechange = function () {
    
  if (xhr.readyState === 4 )
    if(xhr.status === 200){
      donatepiServerConnection=true;
      document.getElementById("donatepiServerStatus").innerHTML="<span style=\"color: green;\">"+xhr.responseText+"</span>";
      
      let authText = `
        <span id="authId">Authenticate before continue!</span>
        <input type="button" id="authButtonId" onclick="auth();" value="Authenticate"/>
        `
      document.getElementById("authDiv").innerHTML=authText;
      
    }else{
      let text = "Donatepi-server status error";
      if(xhr.responseText!="")
        text=xhr.responseText;
      document.getElementById("donatepiServerStatus").innerHTML="<span style=\"color: red;\">"+text+"<br/>status: "+xhr.status+"</span>";
    }
    
  };
  xhr.send();
  printBalance();
});



function printInErrorDiv(messageError, xhr){
  if(typeof messageError !== "undefined" && typeof xhr !== "undefined")
   document.getElementById("errorDiv").innerHTML= messageError+": "+xhr.responseText+"<br/> status:"+xhr.status;
  else if(typeof messageError !== "undefined")
    document.getElementById("errorDiv").innerHTML= messageError;
  else
    document.getElementById("errorDiv").innerHTML= "Generic error!";
}



function onIncompletePaymentFound(payment) { 
  
  //payment is PaymentDTO object
  
  console.log("Incomplete payment not found: "+payment);
  //window.alert("Incomplete payment not found: "+payment);
  //printInErrorDiv("Last payment INCOMPLETE:<br/> "+/*JSON.stringify(*/payment.identifier/*)*/);
  /*
  if(payment.status.cancelled==true || payment.status.user_cancelled==true){
    //LAST PAYMENT CANCELLED
    
  }else if(payment.status.developer_approved==true && payment.status.transaction_verified==true && payment.status.developer_completed==true){
    //LAST PAYMENT DONE
    
  }else{
    //LAST PAYMENT INCOMPLETE
   */ 
    document.getElementById("sendPayments").innerHTML="Last payment INCOMPLETE, waiting for donatepi-server completion...";
    onReadyForServerCompletion(payment.identifier, payment.transaction.txid);
  /*}*/
  
};

function printBalance(){
  
  document.getElementById("donatepiBalance").innerHTML="request donatepi balance....";
  
  let xhr = new XMLHttpRequest();
  xhr.open("GET", "https://api.testnet.minepi.com/accounts/GCZRZSUCS6H2EDBSNQ4RUSNB2SOSSD63WLGLGHTCEFC6ZWMBCIDRNVFU");
  xhr.onreadystatechange = function () {
    
  if (xhr.readyState === 4 )
    if(xhr.status === 200){
      
      let respObj = JSON.parse(xhr.responseText);
      let balance = respObj.balances[0].balance
      
      let updateBalance = document.createElement("input");
      updateBalance.type = "button";
      updateBalance.value = "Update balance";
      updateBalance.addEventListener("click", printBalance);
      
      document.getElementById("donatepiBalance").innerHTML="Donatepi balance: "+balance;
      document.getElementById("donatepiBalance").appendChild(updateBalance);
      
    }else{
      printInErrorDiv("Error request balance",xhr);
    }
    
  };
  xhr.send();
}

function auth(){
  window.Pi.authenticate(scopes, onIncompletePaymentFound)
  .then(function(_authResult) {
    authResult = _authResult;

    document.getElementById("authButtonId").remove();
    document.getElementById("authId").innerHTML="Welcome "+authResult.user.username+", <span style='color: green;'>authentication ok!</span><br/>uid: "+authResult.user.uid+", accessToken: "+authResult.accessToken;
    
    requestUserInfoByAccessToken(_authResult.accessToken);
    createDonationButton();
  })
  .catch(function(error) {
    console.error(error);
    window.alert("Authentication failed!"+error);
  });
}


function createDonationButton(){
  let message = document.createElement("span");
  message.innerHTML="Click button to send 1pi standard donation ";
    
  let sendButton = document.createElement("input");
  sendButton.type = "button";
  sendButton.value = "Send 1pi standard donation";
  sendButton.addEventListener("click", createPay);
    
  document.getElementById("sendPayments").appendChild(message);
  document.getElementById("sendPayments").appendChild(sendButton);
}

function requestUserInfoByAccessToken(userAccessToken){
  
  let data = new Object();
  data.operation = "infoByUserAccessToken";
  data.user_access_token = userAccessToken;
  let dataJson = JSON.stringify(data);
  
  let xhr = new XMLHttpRequest();
  xhr.open("POST", donatepiEndpoint+requestOperation_path);
  
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.setRequestHeader("Content-Length", dataJson.length);
  
  xhr.onreadystatechange = function () {
    
    if (xhr.readyState === 4 )
      if(xhr.status === 200){
        document.getElementById("userInfoByAccessToken").innerHTML="''/me' from pi chain: "+xhr.responseText;
      }else
        printInErrorDiv("Error request user info",xhr);
  };

  xhr.send(dataJson);
  
  document.getElementById("userInfoByAccessToken").innerHTML="request user info by access token...";
}


function createPay(){
  window.Pi.createPayment({
    amount: 1,
    memo: "donation to donatepi app", 
    metadata: {type:"standard donation", amount:"1"},
  }, {
    // Callbacks you need to implement - read more about those in the detailed docs linked below:
    onReadyForServerApproval: onReadyForServerApproval,
    onReadyForServerCompletion: onReadyForServerCompletion,
    onCancel: function(paymentId) {
      //window.alert("payment canceled: "+paymentId);
      printInErrorDiv("payment canceled: "+paymentId);
      document.getElementById("sendPayments").innerHTML="Reload the app for ";
    },
    onError: function(error, payment) {
      //window.alert("payment error: "+error);
      //window.alert("onError: "+payment);
      printInErrorDiv("payment error: "+error);
      document.getElementById("sendPayments").innerHTML="<span style='color: red;'>payment error: "+error+"</span>";
    },
  });
  document.getElementById("sendPayments").innerHTML="waiting for donatepi-server approval...";
}


function onReadyForServerApproval(paymentId){
  
  let data = new Object();
  data.operation = "approvePayment";
  data.payment_id = paymentId;
  let dataJson = JSON.stringify(data);
  
  let xhr = new XMLHttpRequest();
  xhr.open("POST", donatepiEndpoint+requestOperation_path);
  
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.setRequestHeader("Content-Length", dataJson.length);
  
  xhr.onreadystatechange = function () {
    
    if (xhr.readyState === 4 )
      if(xhr.status === 200){
        let paymentDTO = xhr.responseText;
        document.getElementById("sendPayments").innerHTML="waiting for donatepi-server completion...";
      }else
        printInErrorDiv("Error ready for server payment approval",xhr);
  };

  xhr.send(dataJson);

}

function onReadyForServerCompletion(paymentId, txid){
  
  let data = new Object();
  data.operation = "completePayment";
  data.payment_id = paymentId;
  data.txid = txid;
  let dataJson = JSON.stringify(data);
  
  let xhr = new XMLHttpRequest();
  xhr.open("POST", donatepiEndpoint+requestOperation_path);
  
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.setRequestHeader("Content-Length", dataJson.length);
  
  xhr.onreadystatechange = function () {
    
    if (xhr.readyState === 4 )
      if(xhr.status === 200){
        
        let paymentDTO = JSON.parse(xhr.responseText);
        
        document.getElementById("sendPayments").innerHTML="";
        document.getElementById("donationComplete").innerHTML="<span style='color: green;'>Donation done, tank you! </span><br/>"+
        "<span>See on pi blockchain explorer: <a href='"+paymentDTO.transaction._link+"' >json</a> or <a href='https://pi-blockchain.net/tx/"+paymentDTO.transaction.txid+"'>web</a></span>";
        
        printBalance();
        createDonationButton();
      }else
        printInErrorDiv("Error ready for server payment completition",xhr);
  };

  xhr.send(dataJson);
  
}


