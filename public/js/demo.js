var userInfo={
    address:'',
    nonce:''
}

window.onload=()=>{
    if (typeof window.ethereum == 'undefined') {
        alert('MetaMask is required!')
        console.log('MetaMask is required!');
    }else{
        console.log('MetaMask is installed!');
    }

    getNewNonce();
}

const buttonRefresh = document.querySelector('#buttonRefresh');
buttonRefresh.addEventListener('click', () => {
    getNewNonce();
});
async function getNewNonce(){
    axios.get("/api/getNewNonce",{}).then(function (response) {
        if(response.data.code==200){
            console.log('getNewNonce success=',response.data);

            userInfo.nonce=response.data.message;
            $('#inputNonce').val(userInfo.nonce);
        }else{
            console.log('getNewNonce fail=',response.data);
        }
    }).catch(function (error) {
        console.log('getNewNonce error=',error);
    });
}

const buttonBind=document.querySelector('#buttonBind');
buttonBind.addEventListener('click', () => {
    verifyWallet()
});

async function getWallet(){
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    console.log("accounts=",accounts);
    userInfo.address=accounts[0];
    // $('#inputAddress').val(userInfo.address);
}

async function verifyWallet(){
    if(userInfo.nonce==""){
        alert("Please Get Nonce first");
        return
    }

    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    console.log("accounts=",accounts);
    userInfo.address=accounts[0];
    // $('#inputAddress').val(userInfo.address);

    await handleSignMessage(userInfo.address,userInfo.nonce)
        .then(handleAuthenticate)
        .then(getUserInfo)
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
    } catch (error) {
        console.log('handleSignMessage',"Error=",error)
        throw new Error(
            'handleSignMessage',"Error=",error
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

async function getUserInfo(){
    axios.get("/api/getUserInfo",{}).then(function (response) {
        if(response.data.code==200){
            console.log('getUserInfo success=',response.data);

            userInfo.address=response.data.message.address
            userInfo.nonce=response.data.message.nonce;
            $('#inputAddress').val(userInfo.address);
            $('#inputNonce').val(userInfo.nonce);

        }else{
            console.log('getUserInfo fail=',response.data);
        }
    }).catch(function (error) {
        console.log('getUserInfo error=',error);
    });
}
