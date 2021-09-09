async function changePassword() {
    const passFormat = /^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])[a-zA-Z0-9!@#$%^&*]{8,16}$/;
    const userPass = document.getElementById("password");
    if(!userPass.value.match(passFormat)) {
        alert(`Invalid password format, Password should contain:
                8-16 Characters (Numerics, alphabets and !@#$%^&*)
                A capitalized letter
                A non-capitalized letter
                A number`);
        document.getElementById("password").focus();
        return false;
    } else {
        const response = await fetch("http://localhost:5000/account", {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: 'PUT',
            body: JSON.stringify({
                password: userPass.value,
            })
        });
        const responseJson = await response.json();
        if(!response.ok) {
            alert(JSON.stringify(responseJson));
            return false;
        } else {
            alert(JSON.stringify(responseJson));
            window.location.assign('/logout');
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