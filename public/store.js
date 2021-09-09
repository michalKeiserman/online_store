async function addToCart(product){
    const response = await fetch("http://localhost:5000/addToCart", {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        method: 'PUT',
        body: JSON.stringify({
            name: product
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

function search() {
    let input = document.getElementById('searchbar').value;
    input = input.toLowerCase();
    let x = document.getElementsByClassName('product');
    for (let i = 0; i < x.length; i++) {
        if (!x[i].id.toLowerCase().includes(input)) {
            x[i].style.display="none";
        } else {
            x[i].style.display="list-item";
        }
    }
}