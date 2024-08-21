function renderList(){
    const listaMain = document.getElementById('lista-main')
    listaMain.innerHTML = ''
    createDomList(listaMain, listData)
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
                itemDom = document.createElement('input')
                itemDom.id = objectId
                itemWrapperDom.appendChild(itemDom)
                labelDom = document.createElement('label')
                labelDom.for = objectId
                labelDom.innreText = currentItemObj.label
                itemWrapperDom.appendChild(labelDom)
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
    const currentObj = getObjectById(objId, listData)
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
            currentObj.href = document.getElementById(href-`${currentObj.id}`)
            currentObj.anchor = document.getElementById(anchor-`${currentObj.id}`)
        break
    }

    // remove edit attribute from list object
    delete currentObj.edit

    // re render DOM
    renderList()
}

function cancelUpdate(objId, currentList = listData){
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

function listadd(event, type){
    // add item to list object
    const listId = event.currentTarget.closest('ul').dataset.id
    const activeList = getObjectById(listId, listData)
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
            return getObjectById(objId, item)
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
            return { type, id, lable: '', edit }
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
