function renderList(){
    const listaMain = document.getElementById('lista-main')
    listaMain.innerHTML = ''
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
            editItemDom.querySelector('.btn-success').addEventListener('click', () => updateItem(objectId))
            editItemDom.querySelector('.btn-link').addEventListener('click', () => deleteItem(objectId))

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
        //itemTemplateClone.querySelector('.btn-primary').addEventListener('mousedown', () => itemEdite(objectId)) ? drag

        var itemWrapperDom
        if(currentList.type === 'div'){
            itemWrapperDom = itemTemplateClone//itemTemplate.content.cloneNode(true)
            itemWrapperDom.querySelector('.d-flex').classList.add('simpleList')
            itemWrapperDom.querySelector('.d-flex').tabIndex = 1
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
                itemDom.querySelector('.form-check-input').id = objectId
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
                itemWrapperDom.querySelector('.justify-content-between').classList.remove('align-items-center')
                itemWrapperDom.querySelector('.justify-content-between').classList.add('align-items-start')
                createDomList(itemInner, currentItemObj)
            break
            case 'ul':
                itemWrapperDom.querySelector('.justify-content-between').classList.remove('align-items-center')
                itemWrapperDom.querySelector('.justify-content-between').classList.add('align-items-start')
                createDomList(itemInner, currentItemObj)
            break
            case 'ol':
                itemWrapperDom.querySelector('.justify-content-between').classList.remove('align-items-center')
                itemWrapperDom.querySelector('.justify-content-between').classList.add('align-items-start')
                createDomList(itemInner, currentItemObj)
            break
        }
        // itemWrapperDom.setAttribute("tabIndex", "1")
        itemWrapperDom.tabIndex = 1
        listDom.appendChild(itemWrapperDom)
        parentDom.appendChild(listDom)
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
    for(let i = 0 ; i < currentList.items.length; i++){
        if(currentList.items[i].id === objId){
            // remove this object from array
            currentList.items.splice(i, 1)
            break
        }
        if("items" in currentList.items[i]){
            deleteItem(objId, currentList.items[i])
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
            const foundItem = getObjectById(objId, item)
            if(foundItem){
                return foundItem
            }
        }
    }
    
}

function newItemObject(type){
    const id = (Math.random()*10000000).toString(16).split('.')[0]
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

    listData.title = listTitle.value.trim()
    listData.description = document.getElementById('listDescription').value
    const dataToSend = listData
    
    // POST list
    fetchData(`/api/${mode}/list`, 'POST', dataToSend)
    .then(data => {
        if(data){
            if(data.messageType === 'success'){
                // topAlert('success', data.messageTitle, data.messageBody)
                // document.getElementById('meta-title').textContent = listData.title
                // document.getElementById('meta-description').textContent = listData.description
                // document.body.classList.remove('create', 'edit')
                // document.body.classList.add('show')
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
    // console.log(event.currentTarget.value)
    if("id" in listData){
        // publish update
        saveList()
    }
}

function descriptionChanged(event){
    // console.log(event.currentTarget.value)
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
    console.log(objectId)
}