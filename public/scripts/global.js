async function fetchData(action, method, dataToSend){
    let accessToken = localStorage.getItem('accessToken')  // Get current access token

    if(!accessToken){
        accessToken = await refreshAccessToken()
    }

    const response = await fetch(action, { 
            method,
            body: JSON.stringify(dataToSend),
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`
            }
        })

    if (response.status === 401) {  // Token expired or invalid
        // Attempt to refresh token
        const refreshResponse = await fetch('/api/refresh-token', {
            method: 'POST',
            credentials: 'include'  // Send cookies for refresh token
        });

        if (refreshResponse.ok) {
            const data = await refreshResponse.json()
            localStorage.setItem('accessToken', data.accessToken)  // Store new access token
            return fetchData(action, method, dataToSend)  // Retry the request with new token
        } else {
            console.error('Failed to refresh token');
        }
    }else if(!response.ok){
        topAlert('warning', response.status, response.statusText)
    }else{
        const data = await response.json();
        return data;
    }
}

async function refreshAccessToken(){
    // Attempt to refresh token
    const refreshResponse = await fetch('/api/refresh-token', {
        method: 'POST',
        credentials: 'include'  // Send cookies for refresh token
    });

    if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        localStorage.setItem('accessToken', data.accessToken);  // Store new access token
        return data.accessToken
    } else {
        console.error('Failed to refresh token');
    }
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
