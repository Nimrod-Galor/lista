function renderList(){
    const listaMain = document.getElementById('lista-main')
    listaMain.innerHTML = ''

    document.getElementById('meta-title').textContent = listData.title
    document.getElementById('meta-description').textContent = listData.description
    createDomList(listaMain, listData.body)
}

function createDomList(parentDom, currentList){
    // clone list dropdown menu
    let dropdownTemplate = document.getElementById('list-dropdown-template')
    let listMenuDropdown = dropdownTemplate.content.cloneNode(true);
    listMenuDropdown.querySelector('.dropdown-menu').dataset.id = currentList.id
    parentDom.appendChild(listMenuDropdown)

    // create list DOM
    const listDom = document.createElement(currentList.type)
    listDom.id = currentList.id
    // loop list items
    for(let i=0; i < currentList.items.length; i++){
        
        const currentItemObj = currentList.items[i]
        const objectId = currentItemObj.id
        if("edit" in currentItemObj){
            var itemWrapperDom
            if(currentList.type === 'div'){
                itemWrapperDom = document.createElement('div')
                itemWrapperDom.classList.add('simpleList')
            }else{
                itemWrapperDom = document.createElement('li')
            }

            //  Edit version
            const templateDom = document.getElementById(`${currentItemObj.type}-edit-template`)
            const editItemDom = templateDom.content.cloneNode(true)
            if(currentItemObj.edit === true){
                // update edit item title
                editItemTitle = editItemDom.querySelector('.edit-item-title')
                editItemTitle.textContent = editItemTitle.textContent.replace('Add', 'Edit')
            }
            switch(currentItemObj.type){
                case 'link':
                    const inputs = editItemDom.querySelectorAll('input')
                    const labels = editItemDom.querySelectorAll('label')

                    inputs[0].id = `href-${objectId}`
                    inputs[0].value = currentItemObj.href
                    labels[0].htmlFor = `href-${objectId}`

                    inputs[1].id = `anchor-${objectId}`
                    inputs[1].value = currentItemObj.anchor
                    labels[1].htmlFor = `anchor-${objectId}`
                break
                case 'bigtext':
                    editItemDom.querySelector('textarea').id = objectId
                    editItemDom.querySelector('textarea').textContent = currentItemObj.value
                    editItemDom.querySelector('label').htmlFor = objectId
                break
                case 'checkbox':
                    editItemDom.querySelector('input').id = objectId
                    editItemDom.querySelector('input').value = currentItemObj.label || ''
                    editItemDom.querySelector('input').checked = currentItemObj.checked
                    editItemDom.querySelector('label').htmlFor = objectId
                    
                break
                default:
                    editItemDom.querySelector('input').id = objectId
                    editItemDom.querySelector('input').value = currentItemObj.value || ''
                    editItemDom.querySelector('label').htmlFor = objectId
                break
            }

            // add event listeners
            editItemDom.querySelector('.btn-success').addEventListener('click', () => updateItem(objectId))
            if(currentItemObj.edit === true){
                // update mode
                editItemDom.querySelector('.btn-link').addEventListener('click', () => userCancelItemEdit())
            }else{
                // create new item mode
                editItemDom.querySelector('.btn-link').addEventListener('click', () => deleteItem(objectId))
            }

            // Append to DOM
            itemWrapperDom.appendChild(editItemDom)
            itemWrapperDom.classList.add('item-edit-mod')
            listDom.appendChild(itemWrapperDom)
            parentDom.appendChild(listDom)
            
            continue
        }

        const itemTemplate = document.getElementById('item-template')
        const itemTemplateClone = itemTemplate.content.cloneNode(true)
        let test = itemTemplateClone.querySelector('.btn-danger')
        itemTemplateClone.querySelector('.btn-danger').addEventListener('mousedown', () => userDeleteItem(objectId))
        itemTemplateClone.querySelector('.btn-success').addEventListener('mousedown', () => userEditItem(objectId))
        if(i == 0){
            itemTemplateClone.querySelector('.btn-primary.up').disabled = true
        }else{
            itemTemplateClone.querySelector('.btn-primary.up').addEventListener('mousedown', () => userMoveItemUp(objectId))
        }
        if(i == currentList.items.length -1){
            itemTemplateClone.querySelector('.btn-primary.down').disabled = true
        }else{
            itemTemplateClone.querySelector('.btn-primary.down').addEventListener('mousedown', () => userMoveItemDown(objectId))
        }

        var itemWrapperDom
        if(currentList.type === 'div'){
            itemWrapperDom = itemTemplateClone//itemTemplate.content.cloneNode(true)
            const tmpList = itemWrapperDom.querySelector('.d-flex')
            tmpList.classList.add('simpleList')
            tmpList.tabIndex = 1
        }else{
            itemWrapperDom = document.createElement('li')
            itemWrapperDom.appendChild(itemTemplateClone)
        }
        const itemInner = itemWrapperDom.querySelector('.list-item')

        var itemDom
        var labelDom
        switch(currentItemObj.type){
            case 'text':
                itemDom = document.createElement('div')
                itemDom.id = objectId
                itemDom.innerText = currentItemObj.value
                itemInner.appendChild(itemDom)
            break
            case 'bigtext':
                itemDom = document.createElement('div')
                itemDom.id = objectId
                itemDom.style.whiteSpace = 'pre-wrap'
                itemDom.textContent = currentItemObj.value
                itemInner.appendChild(itemDom)
            break
            case 'checkbox':
                let tmpCheckbox = document.getElementById('checkbox-item-template')
                itemDom = tmpCheckbox.content.cloneNode(true);
                const formCheckInput = itemDom.querySelector('.form-check-input')
                formCheckInput.id = objectId
                formCheckInput.checked = currentItemObj.checked
                // formCheckInput.addEventListener('beforechange', userCheckboxClick)
                formCheckInput.addEventListener('change', userCheckboxChanged)
                const labelDom = itemDom.querySelector('.form-check-label')
                labelDom.htmlFor = objectId
                labelDom.textContent = currentItemObj.label
                itemInner.appendChild(itemDom)
            break
            case 'link':
                itemDom = document.createElement('a')
                itemDom.id = objectId
                itemDom.href = currentItemObj.href
                itemDom.innerText = currentItemObj.anchor
                itemInner.appendChild(itemDom)
            break
            case 'div':
            case 'ul':
            case 'ol':
                const tmpItem = itemWrapperDom.querySelector('.justify-content-between')
                tmpItem.classList.remove('align-items-center')
                tmpItem.classList.add('align-items-start')
                createDomList(itemInner, currentItemObj)
            break
        }

        itemWrapperDom.tabIndex = 1
        listDom.appendChild(itemWrapperDom)
        parentDom.appendChild(listDom)
    }
}

// function userCheckboxClick(event){
//     // console.log('checkbox changed', event.currentTarget.id)
//     if(!userIsAudience()){
//         event.stopImmediatePropagation()
//         event.preventDefault()
//         event.stopPropagation()
//         // return
//     }
// }
function userCheckboxChanged(event){
    // console.log('checkbox changed', event.currentTarget.id)
    if(!userIsAudience()){
        // event.preventDefault()
        // event.stopPropagation()
        // event.stopImmediatePropagation()
        event.currentTarget.checked = !event.currentTarget.checked
        const toastwrapper = document.querySelector('.toast')
        toastwrapper.classList.remove('text-bg-success')
        toastwrapper.classList.add('text-bg-danger')
        document.querySelector('.toast-body').innerHTML = 'Unauthorized operation!<br/>Please login to update list.'
        toast.show()
        return
    }
    const currentObj = getObjectById(event.currentTarget.id, listData.body)
    currentObj.checked = event.currentTarget.checked
    if("id" in listData && userIsAudience()){
        // publish update
        saveList()
    }
}

function updateItem(objId){
    const currentObj = getObjectById(objId, listData.body)
    switch(currentObj.type){
        case 'text':
            currentObj.value = document.getElementById(currentObj.id).value
        break
        case 'bigtext':
            currentObj.value = document.getElementById(currentObj.id).value
        break
        case 'checkbox':
            currentObj.label = document.getElementById(currentObj.id).value
        break
        case 'link':
            currentObj.href = document.getElementById(`href-${currentObj.id}`).value
            currentObj.anchor = document.getElementById(`anchor-${currentObj.id}`).value
        break
    }

    // remove edit attribute from list object
    delete currentObj.edit

    // re render DOM
    renderList()

    if("id" in listData){
        // publish update
        saveList()
    }
}

function deleteItem(objId, currentList = listData.body){
    runDeleteItem(objId, currentList)
    // re render DOM
    renderList()
}

function runDeleteItem(objId, currentList){
    for(let i = 0 ; i < currentList.items.length; i++){
        if(currentList.items[i].id === objId){
            // remove this object from array
            currentList.items.splice(i, 1)
            return true
        }
        if("items" in currentList.items[i]){
            const res = runDeleteItem(objId, currentList.items[i])
            if(res === true){
                return true
            }
        }
    }
    return
}

function removeEditItems(currentList = listData.body){
    for(let i = 0 ; i < currentList.items.length; i++){
        if("edit" in currentList.items[i]){
            if(confirm('You have unsaved changes that will be lost')){
                // remove this object from array
                currentList.items.splice(i, 1)
                return true
            }

            return false
        }
        if("items" in currentList.items[i]){
            const res =  removeEditItems(currentList.items[i])
            if(res === true){
                return true
            }
        }
    }
    return
}

function userCancelItemEdit(){
    removeEditKey(listData.body)
    renderList()
}


function removeEditKey(currentList){
    for(let i = 0 ; i < currentList.items.length; i++){
        if("edit" in currentList.items[i]){
            delete currentList.items[i].edit
            return true
        }
        if("items" in currentList.items[i]){
            if(removeEditKey(currentList.items[i]) === true){
                return true
            }
        }
    }
    return false
}

function removeEmptySubLists(currentList = listData.body){
    for(let i = 0 ; i < currentList.items.length; i++){
        if("items" in currentList.items[i]){
            if(currentList.items[i].items.length === 0){
                //remove empty list
                currentList.items.splice(i, 1)
            }else{
                // loop sublist
                removeEmptySubLists(currentList.items[i])
            }
        }
    }
}

function listadd(event, type){
    // remove all open edit items
    if(removeEditItems() === false){
        return
    }
    // add item to list object
    const listId = event.currentTarget.closest('ul').dataset.id
    const activeList = getObjectById(listId, listData.body)
    activeList.items.push(newItemObject(type))
    // render new list to DOM
    renderList()
}

function getObjectById(objId, currentItemObj){
    if(currentItemObj.id === objId){
        return currentItemObj
    }

    for(const item of currentItemObj.items){
        if(item.id === objId){
            return item
        }
        if("items" in item){
            const foundItem = getObjectById(objId, item)
            if(foundItem){
                return foundItem
            }
        }
    }
}

function newItemObject(type){
    const id = (Math.random()*10000000).toString(16).split('.')[0]
    const edit = false // false for creating true for updating
    switch(type){
        case 'text':
            return { type, id, value: '', edit }
        break
        case 'bigtext':
            return { type, id, value: '', edit }
        break
        case 'checkbox':
            return { type, id, label: '', checked: false, edit }
        break
        case 'link':
            return { type, id, href: '', anchor: '', edit }
        break
        case 'div':
            return { type, id, items: [] }
        break
        case 'ul':
            return { type, id, items: [] }
        break
        case 'ol':
            return { type, id, items: [] }
        break
    }
}

function saveList(){
    // check title not empty
    const listTitle = document.getElementById('listTitle')
    if(listData.title === undefined || listData.title === ''){
        listTitle.classList.remove('is-valid')
        listTitle.classList.add('is-invalid')
        return
    }else if(listTitle.classList.contains('is-invalid')){
        listTitle.classList.remove('is-invalid')
        listTitle.classList.add('is-valid')
    }else{
        listTitle.classList.remove('is-valid')
    }

    // remove all open edit items
    const editFound = removeEditItems()
    if(editFound === false){
        return
    }
    if(editFound === true){
        // clear open Edit
        renderList()
    }

    // remove empty Sub lists
    removeEmptySubLists()

    // check list is not empty
    if(listData.body.items.length === 0){
        alert("List cannot be empty!\nAdd items to list.")
        return
    }

    const dataToSend = listData
    const action = mode === 'create' ? 'create' : 'edit'
    // POST list
    fetchData(`/api/list/${action}`, 'POST', dataToSend)
    .then(data => {
        if(data){
            if(data.messageType === 'success'){
                const toastwrapper = document.querySelector('.toast')
                toastwrapper.classList.add('text-bg-success')
                toastwrapper.classList.remove('text-bg-danger')
                document.querySelector('.toast .toast-body').textContent = data.messageBody
                toast.show()
            }else if(data.messageType === 'redirect'){
                window.location.replace(data.messageBody)
            }else{
                topAlert(data.messageType, data.messageTitle, data.messageBody)
            }
        }
    })
}

function titleChanged(event){
    listData.title = event.currentTarget.value.trim()
    if("id" in listData){
        // publish update
        saveList()
    }
}

function descriptionChanged(event){
    listData.description = event.currentTarget.value.trim()
    if("id" in listData){
        // publish update
        saveList()
    }
}

function userDeleteItem(objectId){
    const itemDelete = getObjectById(objectId, listData.body)
    let itemType
    switch(itemDelete.type){
        case 'div':
            itemType = 'Simple list'
        break
        case 'ul':
            itemType = 'Unordered List'
        break
        case 'ol':
            itemType = 'Ordered List'
        break
        default:
            itemType = itemDelete.type
    }
    if(confirm(`Delete ${itemType} item?`)){
        deleteItem(itemDelete.id)
        if("id" in listData){
            // publish update
            saveList()
        }
    }
}

function userEditItem(objectId){
    const itemToUpdate = getObjectById(objectId, listData.body)
    itemToUpdate.edit = true
    renderList()
}

function userMoveItemUp(objectId){
    reorderItem(objectId, listData.body, 'up')
    renderList()
    if("id" in listData){
        debouncedSaveList()
    }
}

function userMoveItemDown(objectId){
    reorderItem(objectId, listData.body, 'down')
    renderList()
    if("id" in listData){
        debouncedSaveList()
    }
}

function reorderItem(objectId, currentList, dir){
    for(let i=0; i < currentList.items.length; i++){
        if(currentList.items[i].id === objectId){
            let to = dir === 'up' ? i-1 : i+1
            if(to >= currentList.items.length){
                to = currentList.items.length-1
            }else if(to < 0){
                to = 0
            }
            currentList.items.move(i, to)
            return true
        }
        if("items" in currentList.items[i]){
            if(reorderItem(objectId, currentList.items[i], dir) === true){
                break
            }
        }
    }
    return false
}

function debounce(func, delay) {
    let timeoutId

    return function(...args) {
        // Clear the existing timeout if the function is called again before delay
        if (timeoutId) {
            clearTimeout(timeoutId)
        }

        // Set a new timeout
        timeoutId = setTimeout(() => {
            func.apply(this, args); // Call the original function with the correct `this` context and arguments
        }, delay)
    }
}

const debouncedSaveList = debounce(saveList, 10000);

function userShowList(){
    document.body.classList.remove('edit')
    document.body.classList.add('show')
    mode = 'show'
    renderList()
}

function userEditList(){
    document.body.classList.remove('show')
    document.body.classList.add('edit')
    mode = 'edit'
}

function inviteuser(event){
    const form = event.currentTarget
    form.classList.add('was-validated')

    if (!form.checkValidity()) {// validation Failed
        event.preventDefault()
        event.stopPropagation()
        return false
    }

    return true
}

function userLangDirChange(dir){
    listData.dir = dir
    const bootstrapLink = document.getElementById('bootstrap-link')
    if(dir==='ltr'){
        document.documentElement.lang = 'en'
        document.documentElement.dir = 'ltr'
        bootstrapLink.integrity = 'sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH'
        bootstrapLink.href = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css'
    }else{
        document.documentElement.lang = 'he'
        document.documentElement.dir = 'rtl'
        bootstrapLink.integrity = 'sha384-dpuaG1suU0eT09tx5plTaGMLBsfDLzUCCUXOY2j/LSvXYuG6Bqs43ALlhIqAJVRb'
        bootstrapLink.href = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.rtl.min.css'
    }
    // ['float-end', 'float-start'].map(item => document.querySelector('.save-btn').classList.toggle(item))
    
    if("id" in listData){
        debouncedSaveList()
    }
}

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

// const shadowTextArea = document.createElement('textarea');

// // Function to decode HTML entities
// function decodeHTML(str) {
//     shadowTextArea.innerHTML = str;
//     return shadowTextArea.value;
// }

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

function toggleClass(objId, className){
    document.getElementById(objId).classList.toggle(className)
    event.currentTarget.classList.toggle(className)
}

function topAlert(type, title, body){
    document.getElementById('top-alert').classList.add('open')
    document.getElementById('top-alert').querySelector('.alert').className = `alert alert-${type}`
    document.getElementById('top-alert-title').innerHTML = title
    document.getElementById('top-alert-body').innerHTML = body
}

function confirmPasswords(){
    // Check if password and confirm password match
    var password = document.getElementById('signup-password').value;
    var confirmPassword = document.getElementById('confirmPassword')

    if (password !== confirmPassword.value) {
        event.preventDefault()
        event.stopPropagation()

        // Show custom validation message
        confirmPassword.setCustomValidity('Passwords do not match')
        confirmPassword.classList.add('is-invalid')

    } else {
        confirmPassword.setCustomValidity('')
        confirmPassword.classList.remove('is-invalid')
        confirmPassword.classList.add('is-valid')
    }
}

function userIsAudience(){
    const userId = getCookie('userId')
    // check if author
    if(listData.authorId === userId){
        return true
    }
    // check if audience
    if(listData.viewersIDs.includes(userId)){
        return true
    }
    return false
}

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register("/serviceworker.js")
}

Array.prototype.move = function (from, to) {
    this.splice(to, 0, this.splice(from, 1)[0]);
}