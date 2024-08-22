async function fetchData(action, method, dataToSend){
    return fetch(action, {
        method,
        body: JSON.stringify(dataToSend),
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getCookie('jwt')}`
        }
    })
    .then(res => {
        if(res.ok){
            return res.json()
        }else{
            topAlert('alert-danger', res.status, res.statusText)
        }
    })
    .catch(err => {
        console.log('error', err)
    })
}

function validateForm(event){
    const form = event.currentTarget
    form.classList.add('was-validated')

    if (!form.checkValidity()) {// validation Failed
        event.preventDefault()
        event.stopPropagation()
        return false
    }

    // start submit button spiner
    form.classList.add('disabled')
    // disabel submit buttn
    event.submitter.disabled = true
    
    return true
}

// Function to encode HTML entities
// function encodeHTML(str) {
//     return str.replace(/&/g, '&amp;')
//               .replace(/</g, '&lt;')
//               .replace(/>/g, '&gt;')
//               .replace(/"/g, '&quot;')
//               .replace(/'/g, '&#39;');
// }

const shadowTextArea = document.createElement('textarea');

// Function to decode HTML entities
function decodeHTML(str) {
    shadowTextArea.innerHTML = str;
    return shadowTextArea.value;
}

function setCookie(cname, cvalue, exdays) {
    const d = new Date()
    d.setTime(d.getTime() + (exdays*24*60*60*1000))
    let expires = "expires="+ d.toUTCString()
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/"
}

function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}