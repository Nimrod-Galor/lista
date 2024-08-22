console.log('themea.js')

function toggleClass(objId, className){
    document.getElementById(objId).classList.toggle(className)
    event.currentTarget.classList.toggle(className)
}

function topAlert(type, title, body){
    document.getElementById('top-alert').classList.add('open')
    document.getElementById('top-alert-alert').classList.add(`alert-${type}`)
    document.getElementById('top-alert-title').innerHTML = title
    document.getElementById('top-alert-body').innerHTML = body
}

function profileDropdownClick(){
    event.stopPropagation()
    let obj = document.getElementById("profileDropdown")
    if(obj.classList.contains("show")){
        obj.classList.remove("show")
        document.body.removeEventListener('click', profileDropdownClick)
    }else{
        obj.classList.add("show")
        document.body.addEventListener('click', profileDropdownClick)
    }
}

