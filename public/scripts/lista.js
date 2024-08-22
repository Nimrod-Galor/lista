function renderList(){
    const listaMain = document.getElementById('lista-main')
    listaMain.innerHTML = ''
    createDomList(listaMain, listData.body)
}

function createDomList(parentDom, currentList){
    // clone list dropdown menu
    let tmpDropdown = document.getElementById('list-dropdown-template')
    let clonDropdown = tmpDropdown.content.cloneNode(true);
    clonDropdown.querySelector('.dropdown-menu').dataset.id = currentList.id
    parentDom.appendChild(clonDropdown)

    // create list DOM
    const listDom = document.createElement(currentList.type)
    listDom.id = currentList.id
    // loop list items
    for(let i=0; i < currentList.items.length; i++){
        const itemWrapperDom = currentList.type === 'div' ? document.createElement('div') : document.createElement('li')
        const currentItemObj = currentList.items[i]
        const objectId = currentItemObj.id
        if("edit" in currentItemObj){
            //  Edit version
            const templateDom = document.getElementById(`${currentItemObj.type}-edit-template`)
            const editItemDom = templateDom.content.cloneNode(true)
            switch(currentItemObj.type){
                case 'link':
                    const inputs = editItemDom.querySelectorAll('input')
                    const labels = editItemDom.querySelectorAll('label')

                    inputs[0].id = `href-${objectId}`
                    labels[0].htmlFor = `href-${objectId}`

                    inputs[1].id = `anchor-${objectId}`
                    labels[1].htmlFor = `anchor-${objectId}`
                break
                case 'bigtext':
                    editItemDom.querySelector('textarea').id = objectId
                    editItemDom.querySelector('label').htmlFor = objectId
                break
                default:
                    editItemDom.querySelector('input').id = objectId
                    editItemDom.querySelector('label').htmlFor = objectId
                break
            }

            // add event listeners
            editItemDom.querySelector('.btn-success').addEventListener('click', () => updateItem(event, objectId))
            editItemDom.querySelector('.btn-link').addEventListener('click', () => cancelUpdate(objectId))

            // Append to DOM
            itemWrapperDom.appendChild(editItemDom)
            listDom.appendChild(itemWrapperDom)
            parentDom.appendChild(listDom)
            
            continue
        }

        var itemDom
        var labelDom
        switch(currentItemObj.type){
            case 'text':
                itemDom = document.createElement('div')
                itemDom.id = objectId
                itemDom.innerText = currentItemObj.value
                itemWrapperDom.appendChild(itemDom)
            break
            case 'bigtext':
                itemDom = document.createElement('div')
                itemDom.id = objectId
                itemDom.style.whiteSpace = 'pre-wrap'
                itemDom.textContent = currentItemObj.value
                itemWrapperDom.appendChild(itemDom)
            break
            case 'checkbox':
                let tmpCheckbox = document.getElementById('checkbox-item-template')
                itemDom = tmpCheckbox.content.cloneNode(true);
                itemDom.querySelector('.form-check-input').id = objectId
                const labelDom = itemDom.querySelector('.form-check-label')
                labelDom.htmlFor = objectId
                labelDom.textContent = currentItemObj.label
                itemWrapperDom.appendChild(itemDom)
            break
            case 'link':
                itemDom = document.createElement('a')
                itemDom.id = objectId
                itemDom.href = currentItemObj.href
                itemDom.innerText = currentItemObj.anchor
                itemWrapperDom.appendChild(itemDom)
            break
            case 'div':
                createDomList(itemWrapperDom, currentItemObj)
            break
            case 'ul':
                createDomList(itemWrapperDom, currentItemObj)
            break
            case 'ol':
                createDomList(itemWrapperDom, currentItemObj)
            break
        }
        
        listDom.appendChild(itemWrapperDom)
        parentDom.appendChild(listDom)
    }
}

function updateItem(event, objId){
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
}

function cancelUpdate(objId, currentList = listData.body){
    for(let i = 0 ; i < currentList.items.length; i++){
        if(currentList.items[i].id === objId){
            // remove this object from array
            currentList.items.splice(i, 1)
            break
        }
        if("items" in currentList.items[i]){
            cancelUpdate(objId, currentList.items[i])
        }
    }

    // re render DOM
    renderList()
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
            return removeEditItems(currentList.items[i])
        }
    }
    return
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
            const fountItem = getObjectById(objId, item)
            if(fountItem){
                return fountItem
            }
        }
    }
    
}

function newItemObject(type){
    const id = (Math.random()*100000000000000000).toString(16)
    const edit = true
    switch(type){
        case 'text':
            return { type, id, value: '', edit }
        break
        case 'bigtext':
            return { type, id, value: '', edit }
        break
        case 'checkbox':
            return { type, id, label: '', edit }
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
    if(listTitle.value.trim() === ''){
        listTitle.classList.remove('is-valid')
        listTitle.classList.add('is-invalid')
        return
    }else{
        listTitle.classList.remove('is-invalid')
        listTitle.classList.add('is-valid')
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

    // const form = document.getElementById('form-meta')
    // const formData = new FormData(form);
    // const dataToSend = Object.fromEntries(formData);
    // if(listData.id != 0){
    //     dataToSend.id = listData.id
    // }
    // dataToSend.body = JSON.stringify(listData.body)

    listData.title = listTitle.value.trim()
    listData.description = document.getElementById('listDescription').value
    const dataToSend = listData
    // delete dataToSend.id
    // POST list
    fetchData(`/api/create/list`, 'POST', dataToSend)
    .then(data => {
        console.log(data)
        // {
        //     "messageBody": "List \"list 1\" was created successfuly",
        //     "messageTitle": "List Created",
        //     "messageType": "success"
        // }
        if(data){
            if(data.messageType === 'success'){
                topAlert('alert-success', data.messageTitle, data.messageBody)
                document.getElementById('meta-title').textContent = listData.title
                document.getElementById('meta-description').textContent = listData.description
                document.body.classList.remove('create', 'edit')
                document.body.classList.add('show')
            }else{
                topAlert('alert-danger', data.messageTitle, data.messageBody)
            }
        }
    })
}