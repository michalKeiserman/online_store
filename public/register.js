const bodyparser = require("body-parser");

async function validateEmailAndPassword(mailInput, passInput, passAgainInput) {
    const mailFormat = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    const passFormat = /^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])[a-zA-Z0-9!@#$%^&*]{8,16}$/;

    if(!mailInput.value.match(mailFormat)) {
        alert("Invalid email, please try again.");
        document.getElementById("email").focus();
        return false;
    } else if(!passInput.value.match(passFormat)) {
        alert(`Invalid password format, Password should contain:
                8-16 Characters (Numerics, alphabets and !@#$%^&*)
                A capitalized letter
                A non-capitalized letter
                A number`);
        document.getElementById("password").focus();
        return false;
    } else if(passInput.value !== passAgainInput.value) {
        alert("Passwords do not match, please try again.")
        document.getElementById("password2").focus();
        return false;
    } else {
        const response = await fetch("http://localhost:5000/register", {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify({
                email: mailInput.value,
                password: passInput.value,
                cart: [],
            })
        });
        const responseJson = await response.json();
        if(!response.ok) {
            alert(JSON.stringify(responseJson));
            return false;
        } else {
            alert(JSON.stringify(responseJson));
            window.location.assign('/login');
        }
        return true;
    }
}

function showPassword() {
    const pass = document.getElementById("password");
    const pass2 = document.getElementById("password2");
    if(pass.type === "password") {
        pass.type = "text";
        pass2.type = "text";
    } else {
        pass.type = "password";
        pass2.type = "password";
    }
}