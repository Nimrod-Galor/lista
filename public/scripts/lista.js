function renderList(){
    const listaMain = document.getElementById('lista-main')
    const listDom = createDomList(listaMain, listData)
    listaMain.innerHTML = ''
    listaMain.appendChild(listDom)
}

function createDomList(parentDom, currentList){
    // clone list dropdown menu
    let tmpDropdown = document.getElementById('list-dropdown-tmplate')
    let clonDropdown = tmpDropdown.content.cloneNode(true);
    parentDom.appendChild(clonDropdown)

    // lopp list items
    for(leti=0; i < currentList.items.length; i++){
        const currentItem = currentList.items[i]
        switch(currentItem.type){
            case 'text':
                // return { type, id, value: '' }
                if("edit" in currentItem){
                    //  Edit version

                }else{

                }
            break
            case 'bigtext':
                // return { type, id, value: '' }
                if("edit" in currentItem){
                    //  Edit version

                }else{

                }
            break
            case 'checkbox':
                // return { type, id, lable: '' }
                if("edit" in currentItem){
                    //  Edit version

                }else{

                }
            break
            case 'link':
                // return { type, id, href: '', anchor: '' }
                if("edit" in currentItem){
                    //  Edit version

                }else{

                }
            break
            case 'simple':
                // return { type, id, items: [] }
                if("edit" in currentItem){
                    //  Edit version

                }else{

                }
            break
            case 'unordered':
                // return { type, id, items: [] }
                if("edit" in currentItem){
                    //  Edit version

                }else{

                }
            break
            case 'ordered':
                // return { type, id, items: [] }
                if("edit" in currentItem){
                    //  Edit version

                }else{

                }
            break
        }
    }
}

function listadd(event, type){
    // add item to list object
    const listId = event.currentTarget.closest('ul').dataset.id
    const activeList = getActiveList(listId, listData) 
    activeList.items.push(newItemObject(type))
    // render new list to DOM
}

function getActiveList(listId, currentItem){
    if(currentItem.id === listId){
        return currentItem
    }

    for(const item of currentItem.items){
        if("id" in item){
            if(item.id === listId){
                return item
            }
            return getActiveList(listId, item)
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
        case 'simple':
            return { type, id, items: [], edit }
        break
        case 'unordered':
            return { type, id, items: [], edit }
        break
        case 'ordered':
            return { type, id, items: [], edit }
        break
    }
}
