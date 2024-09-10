
function deleteItemClick(header){
    return confirm(`Delete Item (${header})?`)
}

function editItemClick(contentType, data){
    data = JSON.parse(data)
    const form = document.getElementById(`create-${contentType}`)
    form.action = `/admin/edit/${contentType}`
    form.classList.remove('was-validated', 'create')
    form.classList.add('edit')
    //enable fieldset
    form[0].disabled = false
    let selectedRoleName
    // fill form elements with data
    for(const elmId in form.elements){
        // get value from data object
        let key = Object.keys(data).find(item => form.elements[elmId].name === item.toLowerCase())
        if(key === undefined){
            // fields we dont have in fields interface
            if(form.elements[elmId].name === "password"){// password is a special case
                // set input as not required
                form.elements[elmId].required = false
            }
        }else{
            console.log('type', form.elements[elmId].type)
            switch(form.elements[elmId].type){
                case 'checkbox':
                    form.elements[elmId].checked = data[key]
                break;
                case 'select-one':
                    if(form.elements[elmId].id === 'user-role'){
                        selectedRoleName = data[key]
                    }
                    for(const op of form.elements[elmId].options){
                        if(op.label === data[key]){
                            op.selected = true
                        }
                    }
                break
                case "textarea":
                    switch(contentType){
                        case "page":
                            window.pageEditor.setData(decodeHTML(data[key]))
                        break
                        case "post":
                            window.postEditor.setData(decodeHTML(data[key]))
                        break
                        case "comment":
                            form.elements[elmId].value = data[key]
                        break
                    }
                break
                default:
                    form.elements[elmId].value = data[key]
                break
            }
        }
    }

    if(contentType === 'user'){
        // update checkbox lable
        document.querySelector("label[for=user-emailverified]").innerHTML = 'Verified user'
        if(document.getElementById('user-role').length === 0){
            // update role list
            populateRoleList(selectedRoleName)
        }
    }

    openModelView(`model-${contentType}`)
}

function createItemClick(contentType, fields){
    const form = document.getElementById(`create-${contentType}`)
    form.action = `/admin/create/${contentType}`
    form.classList.remove('was-validated', 'edit')
    form.classList.add('create')
    //enable fieldset
    form[0].disabled = false
    // reset inputs
    fields = JSON.parse(fields)
    // loop for elements
    for(const elmId in form.elements){
        
        let key = fields.find(item => form.elements[elmId].name === item.toLowerCase())
        if(key === undefined){
            // fields we dont have in fields interface
            if(form.elements[elmId].name === "password"){// password is a special case
                // set input as not required
                form.elements[elmId].required = true
            }
        }
        switch(form.elements[elmId].type){
            case 'checkbox':
                form.elements[elmId].checked = true
            break;
            case 'select-one':
                if(form.elements[elmId].options.length > 0){
                    form.elements[elmId].options[0].selected = true
                }
            break
            case "textarea":
                    switch(contentType){
                        case "page":
                            window.pageEditor.setData('')
                        break
                        case "post":
                            window.postEditor.setData('')
                        break
                    }
                break
            default:
                form.elements[elmId].value = ''
            break
        }
    }

    if(contentType === 'user'){
        // update checkbox lable
        document.querySelector("label[for=user-emailverified]").innerHTML = 'Send verification email'
        if(document.getElementById('user-role').length === 0){
            // update role list
            populateRoleList()
        }
    }

    openModelView(`model-${contentType}`)
}

function openModelView(modelName){
    // hide all forms
    const mfs = document.querySelectorAll('.content-type-wrapp')
    mfs.forEach((mf) => {
        if(mf.id == modelName){
            // show selected model form
            mf.classList.remove('d-none')
        }else{
            mf.classList.add('d-none')
        }
    })

    // open div
    document.querySelector('.horizontal-collapse').classList.add('open')
}

function closeModelView(){
    document.querySelector('.horizontal-collapse').classList.remove('open')
}

function toggleClass(objId, className){
    document.getElementById(objId).classList.toggle(className);
    event.currentTarget.classList.toggle(className);
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

function topAlert(type, title, body){
    document.getElementById('top-alert').classList.add('open');
    document.getElementById('top-alert').querySelector('.alert').className = `alert alert-${type}`
    document.getElementById('top-alert-title').innerHTML = title;
    document.getElementById('top-alert-body').innerHTML = `<ul><li>${body}</li></ul>`;
}

function populateRoleList(selectedRoleName = '-'){
    fetchData('/api/roles', 'GET')
    .then((data) => {
        if(data.messageType === 'data'){
            const roleSelect = document.getElementById('user-role')
            const rolesOrder = {
                "admin": 4,
                "editor": 3,
                "author": 2,
                "contributor": 1,
                "subscriber": 0,
            }
            data.messageBody.sort((a,b) => rolesOrder[a.name] < rolesOrder[b.name] ? -1 : 1).map( (item) => {
                let opt = document.createElement("option");
                opt.value = item.id
                opt.innerHTML = item.name;
                opt.dataset.description = item.description
                if(item.name === selectedRoleName){
                    opt.selected = true
                    document.getElementById('user-role-RoleHelpBlock').innerText = `* ${item.description}`
                }
                
                roleSelect.append(opt);
            });

            if(selectedRoleName === '-'){
                document.getElementById('user-role-RoleHelpBlock').innerText = `* ${data.messageBody[0].description}`
            }
        }else{// Error
            console.error(data.messageBody)
        }
    })
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function decodeHTML(str) {
    const shadowTextArea = document.createElement('textarea');
    shadowTextArea.innerHTML = str;
    return shadowTextArea.value;
}

function updateRoleDescription(event){
    document.getElementById('user-role-RoleHelpBlock').innerText = `* ${event.currentTarget.options[event.currentTarget.selectedIndex].dataset.description}`
}

function bulkInvert(){
    // invert all checkbox selections
    const checks = document.querySelectorAll('.item-check')
    for(let i=0; i < checks.length; i++){
        checks[i].checked = !checks[i].checked
    }
}

function bulkOperation(event){
    const checks = document.querySelectorAll('.item-check:checked')
    // check if any items where selected
    if(checks.length === 0){
        event.preventDefault()
        event.stopPropagation()
        alert("No items selected!")
        return false
    }
    const bulkAction = document.getElementById('bulk-action')
    const operation = bulkAction.value
    // check if any action was selected
    if(operation === ""){
        event.preventDefault()
        event.stopPropagation()
        alert("No action selected!")
        return false
    }

    const contentType = document.getElementById("contentType").value
    let deleteMsg = `${bulkAction.options[bulkAction.selectedIndex].text} ${contentType}:`

    const operationPermission = operation === 'unpublish'? 'publish' : operation
    for(let i=0; i < checks.length; i++){
        // set confirmation message
        deleteMsg += '\n' + checks[i].dataset.header
        
        // check all item meet action permissions
        if(!checks[i].dataset[`allow${operationPermission}`]){
            event.preventDefault()
            event.stopPropagation()
            topAlert("warning", "invalidSelection", `You have no permission to ${operation} Some of the items selected!<br> click <button class="btn btn-link m-0 p-0 align-baseline" onclick="removeNopermissionBulkitems()">here</button> to uncheck these items.`)
            return false
        }
    }

    if(!confirm(deleteMsg)){
        event.preventDefault()
        event.stopPropagation()
        return false
    }

    const form = event.currentTarget
    form.action += `/bulk/${operation}`

    for(let i=0; i < checks.length; i++){
        // create checkbox
        const check = document.createElement("input")
        check.type = "checkbox"
        check.name = "id"
        check.value = checks[i].value
        check.checked = true
        form.appendChild(check)
        // create input hidden for header information
        const header = document.createElement("input")
        header.type = "hidden"
        header.name = "header"
        header.value = checks[i].dataset.header
        form.appendChild(header)
    }

    return true
}

function removeNopermissionBulkitems(){
    const checks = document.querySelectorAll('.item-check:checked')
    const operation = document.getElementById('bulk-action').value
    for(let i=0; i < checks.length; i++){
        if(!checks[i].dataset[`allow${operation}`]){
            checks[i].checked = false
        }
    }
}