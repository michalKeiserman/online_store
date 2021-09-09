async function giftFunc() {
    const mailFormat = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    const mailInput = document.getElementById("umail").value;
    const moneyInput = document.getElementById("money").value;
    if(isNaN(moneyInput)) {
        alert("Money amount should be a number!");
        moneyInput.focus();
        return false;
    } else if(!mailInput.match(mailFormat)) {
        alert(`Invalid eMail!`);
        mailInput.focus();
        return false;
    } else {
        const response = await fetch("http://localhost:5000/giftcard", {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify({
                mail: mailInput,
                amount: moneyInput
            })
        });
        const responseJson = await response.json();
        if(!response.ok) {
            alert(JSON.stringify(responseJson));
            return false;
        } else {
            alert(JSON.stringify(responseJson));
            window.location.assign('/');
            return true;
        }
    }
}