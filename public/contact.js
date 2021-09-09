async function contactFunc() {
    const fName = document.getElementById("fname");
    const messageContent = document.getElementById("subject");
    const userCountry = document.getElementById("country");
    const response = await fetch("http://localhost:5000/contact", {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({
            name: fName.value,
            country: userCountry.value,
            content: messageContent.value
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