let useWallet = true;

async function checkoutFunc() {
    let date = new Date();
    const year = document.getElementById("expYear").value;
    const month = document.getElementById("expMonth").value;
    const mailInput = document.getElementById("mailInput").value;
    const ccNum = document.getElementById("ccnum").value;
    const mailFormat = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if(year < date.getFullYear() || (year == date.getFullYear() && month < date.getMonth())) {
        alert("Your credit card has already expired!")
        year.focus();
        return false;
    } else if(!Number.isInteger(month) || month < 1 || month > 12) {
        alert(`Invalid month! Please enter an integer between 1-12`);
        mailInput.focus();
        return false;
    } else if(!mailInput.match(mailFormat)) {
        alert(`Invalid eMail!`);
        mailInput.focus();
        return false;
    } else if(isNaN(ccNum)) {
        alert(`Invalid CC number!`);
        ccNum.focus();
        return false;
    } else {
        const response = await fetch("http://localhost:5000/checkout", {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify({
                wallet: useWallet
            })
        });
        const responseJson = await response.json();
        if(!response.ok) {
            alert(JSON.stringify(responseJson));
            return false;
        }
        alert(JSON.stringify(responseJson));
        window.location.assign('/store');
        return true;
    }
}

function useWalletFunction() {
    if(useWallet) {
        useWallet = false;
    } else {
        useWallet = true;
    }
}