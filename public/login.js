let rememberMe = false;

async function validateEmailAndPassword(mailInput, passInput) {
    const mailFormat = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    const passFormat = /^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])[a-zA-Z0-9!@#$%^&*]{8,16}$/;

    if(!mailInput.value.match(mailFormat) && !mailInput.value.match("admin")) {
        alert("Invalid email, please try again.");
        document.getElementById("email").focus();
        return false;
    } else if(!passInput.value.match(passFormat) && !passInput.value.match("admin")) {
        alert(`Invalid password format, Password should contain:
                8-16 Characters (Numerics, alphabets and !@#$%^&*)
                A capitalized letter
                A non-capitalized letter
                A number`);
        document.getElementById("password").focus();
        return false;
    } else {
        const response = await fetch("http://localhost:5000/login", {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify({
                email: mailInput.value,
                password: passInput.value,
                remember: rememberMe
            })
        });
        const responseJson = await response.json();
        if(!response.ok) {
            alert(JSON.stringify(responseJson));
            return false;
        } else {
            alert(JSON.stringify(responseJson));
            window.location.assign('/store');
        }
        return true;
    }
}

function showPassword() {
    const pass = document.getElementById("password");
    if(pass.type === "password") {
        pass.type = "text";
    } else {
        pass.type = "password";
    }
}

function rememberMeFunction() {
    if(rememberMe) {
        rememberMe = false;
    } else {
        rememberMe = true;
    }
}
