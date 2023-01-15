var userInfo={
    address:'',
    nonce:''
}

if (typeof window.ethereum == 'undefined') {
    console.log('MetaMask is required!');
    // web3 = new Web3(window.ethereum);
}else{
    console.log('MetaMask is installed!');
}

const getUserInfoButton = document.querySelector('#get-user-info');
getUserInfoButton.addEventListener('click', () => {
    getUserInfo();
});
function getUserInfo(){
    axios.get("/api/getUserInfo",{}).then(function (response) {
        if(response.data.code==200){
            console.log('getUserInfo success=',response.data);

            userInfo.address=response.data.message.address
            userInfo.nonce=response.data.message.nonce;
            $('#user-address').val(userInfo.address);
            $('#user-nonce').val(userInfo.nonce);
        }else{
            console.log('getUserInfo fail=',response.data);
        }
    }).catch(function (error) {
        console.log('getUserInfo error=',error);
    });
}

const getNewNonceButton = document.querySelector('#get-new-nonce');
getNewNonceButton.addEventListener('click', () => {
    getNewNonce();
});
async function getNewNonce(){
    axios.get("/api/getNewNonce",{}).then(function (response) {
        if(response.data.code==200){
            console.log('getNewNonce success=',response.data);

            userInfo.nonce=response.data.message;
            $('#user-nonce').val(userInfo.nonce);
        }else{
            console.log('getNewNonce fail=',response.data);
        }
    }).catch(function (error) {
        console.log('getNewNonce error=',error);
    });
}

const getWalletButton = document.querySelector('#get-wallet');
getWalletButton.addEventListener('click', () => {
    getWallet();
});
async function getWallet(){
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    console.log("accounts=",accounts);
    userInfo.address=accounts[0];
    $('#user-address').val(userInfo.address);
}


const verifyWalletButton=document.querySelector('#verify-wallet');
verifyWalletButton.addEventListener('click', () => {
    verifyWallet();
});

async function verifyWallet(){
    if(userInfo.address==""){
        alert("Please Get Wallet first");
        return;
    }

    if(userInfo.nonce==""){
        alert("Please Get Nonce first");
        return
    }

    await handleSignMessage(userInfo.address,userInfo.nonce)
        .then(handleAuthenticate)
        .catch((error)=>{
            alert("Error! See logs.");
        })
}

async function handleSignMessage(address,nonce){
    try {
        console.log("handleSignMessage","publicAddress=",address,"nonce=",nonce)
        const signature=await ethereum.request({
            method: 'personal_sign',
            params:[address,'I am signing my one-time nonce: '+nonce]
        });
        console.log("handleSignMessage","publicAddress=",address,"signature=",signature)
        return { address, signature };
    } catch (err) {
        console.log('handleSignMessage',"Error=",err)
        throw new Error(
            'handleSignMessage',"Error=",err
        );
    }
}

async function handleAuthenticate({ address, signature }){
    console.log("handleAuthenticate: address=",address,"signature=",signature)

    axios.post("/api/verifySignature",{
        address:address,
        signature:signature,
    },{}).then(function (response) {
        if(response.data.code==200){
            console.log('handleAuthenticate success=',response.data);
        }else{
            console.log('handleAuthenticate fail=',response.data);
        }

        const status=response.data.message
        if(status==true){
            alert("Verification success")
        }else{
            alert("Verification Failure")
        }

    }).catch(function (error) {
        console.log('handleAuthenticate','error=',error)
        throw new Error(
            'handleAuthenticate','error=',error
        );
    });
}