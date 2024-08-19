const commentsOrderEnum = {
    dateDesc: 'datedesc',
    dateAsc: 'dateasc'
}

let activeForm
const postComments = {
    total: 0,
    loaded: 0,
    page: 1,
    order: commentsOrderEnum.dateDesc,
    comments: []
}

function commentsReOrder(event){
    console.log(event.currentTarget.value)
    // reset postComments
    postComments.loaded = 0
    postComments.page = 1
    postComments.order = event.currentTarget.value
    postComments.comments = []
    // clear comments from DOM
    document.getElementById('comments').innerHTML = ''
    // get comments
    getComments()
}

async function countComments(){
    const id = document.getElementById('post-id').value
    const dataToSend = {id}
    await fetchData('api/count/comments', "POST", dataToSend)
    .then(data => {
        if(data.messageType === 'data'){
            postComments.total = parseInt(data.messageBody)
            if(postComments.total > 0){
                // load comments
                getComments()
            }else{
                // no comments
                document.querySelector('#loadin-comments').classList.add('d-none')
                document.querySelector('#no-comments').classList.remove('d-none')
            }
        }else{// Error
            alertComment(data)
        }
    })
}

function loadMoreComments(){
    document.getElementById('loadin-comments').classList.remove('d-none')
    postComments.page++
    getComments()
}

async function getComments(){
    console.log('get Comments')
    const post = document.getElementById('post-id').value
    const dataToSend = {post, page: postComments.page, order: postComments.order}

    // hide load more comments
    document.getElementById('load-more-comment-btn').classList.add('d-none')

    await fetchData('api/comments', "POST", dataToSend)
    .then(data => {
        console.log('data', data)
        // hide loading comments info
        document.getElementById('loadin-comments').classList.add('d-none')

        if(data.messageType === 'data'){
            constractComment(document.getElementById('comments'), data.messageBody, true)

            // show orderBy
            document.getElementById('comments-orderby').classList.remove('d-none')

            postComments.comments.push(...data.messageBody)
            postComments.loaded += data.messageBody.length

            if(postComments.total > postComments.loaded){
                document.getElementById('load-more-comment-btn').classList.remove('d-none')
            }else{
                document.getElementById('load-more-comment-btn').classList.add('d-none')
            }

        }else{// Error
            alertComment(data)
        }
    })
}

function constractComment(parentObj, data, commentIndex){
    for(let i = 0; i< data.length; i++){
        // create comment item
        const commentTemplate = document.querySelector("#comment-template")

        // Clone the new row and insert it into the table
        const clone = commentTemplate.content.cloneNode(true)

        if(commentIndex){
            clone.querySelector('.comment-index').innerText = postComments.order === commentsOrderEnum.dateDesc ? postComments.total - (postComments.loaded + i) : postComments.loaded + 1 + i
        }
        clone.querySelector('.comment-author').innerText = data[i].author.userName
        clone.querySelector('.comment-createdat').innerText = data[i].createdAt
        clone.querySelector('.comment-content').textContent = decodeHTML(data[i].comment)
        clone.querySelector('.btn-reply').dataset.parentComment = data[i].id
        clone.querySelector('.btn-reply').addEventListener('click', (event) => {
            if(activeForm){
                // if we have selected Form remove it from DOM
                activeForm.remove()
            }
            // Select Comment Form
            const form = document.querySelector('.create-comment-form')
            // Clone Comment Form
            activeForm = form.cloneNode(true)
            // reset id
            activeForm.id = "reply-alert"
            // Update Legend
            activeForm.querySelector('legend').innerText = 'Reply Comment'
            //Update hidden input parent comment id
            activeForm.querySelector('#parent-comment').value = event.target.dataset.parentComment

            //  Update alert close buttn click event
            activeForm.querySelector('.close-btn').onclick = () => {
                activeForm.remove()
                activeForm = undefined
            }

            // upadate rest Button
            const cancelBtn = activeForm.querySelector('.reset')
            cancelBtn.type = 'button'
            cancelBtn.addEventListener('click', (event) => {
                event.target.parentNode.parentNode.remove()
            })

            // Append to fieldset
            event.target.parentNode.appendChild(activeForm)
        })

        clone.querySelector('.likes').innerText = data[i].likes > 0 ? data[i].likes : ''
        clone.querySelector('.like-btn').dataset.commentId = data[i].id
        clone.querySelector('.like-btn').addEventListener('click', (event) => {
            event.currentTarget.parentNode.disabled = true
            if(isFirstVote(event.currentTarget.dataset.commentId), 'like'){
                const dataToSend = {id: event.currentTarget.dataset.commentId}
                fetchData('api/like/comment', "POST", dataToSend)
            }
        })

        clone.querySelector('.dislikes').innerText = data[i].dislikes > 0 ? data[i].likes : ''
        clone.querySelector('.dislike-btn').dataset.commentId = data[i].id
        clone.querySelector('.dislike-btn').addEventListener('click', (event) => {
            event.currentTarget.parentNode.disabled = true
            if(isFirstVote(event.currentTarget.dataset.commentId, 'dislike')){
                const dataToSend = {id: event.currentTarget.dataset.commentId}
                fetchData('api/dislike/comment', "POST", dataToSend)
            }
        })

        // append item to list
        parentObj.appendChild(clone)

        if(data[i].replies && data[i].replies.length > 0){
            // create new item
            const li = document.createElement('li')
            // create new list
            const ul = document.createElement('ul')
            li.appendChild(ul)
            // append new list to parenrt element
            parentObj.appendChild(li)
            constractComment(ul, data[i].replies)
        }
    }
}

function isFirstVote(commentId, vote){
    if(getCookie(commentId) == ""){// cookie not found. first vote
        setCookie(commentId, vote, 128)
        return true
    }
    return false
}

async function postComment(event){
    event.preventDefault()
    event.stopPropagation()

    activeForm = event.currentTarget
    activeForm.classList.add('was-validated')

    if (!activeForm.checkValidity()) {// validation Failed
        return false
    }

    // start submit button spiner
    activeForm.classList.add('disabled')
    // disabel submit buttn
    // event.submitter.disabled = true

    //Post form data
    const formData = new FormData(activeForm);
    const dataToSend = Object.fromEntries(formData);

    // encode body
    // dataToSend.body = encodeHTML(dataToSend.body)

    // disabel fieldset
    activeForm[0].disabled = true
    //  send data
    await fetchData(activeForm.action, "POST", dataToSend)
    .then((data) => {
        console.log('data', data)
        if(activeForm.id == 'reply-alert'){// reply form
            //remove Form Elements from DOM (but not the Alert)
            activeForm.querySelector('.form-floating').remove()
            activeForm.querySelectorAll('.btn').forEach(element => {
                element.remove()
            });
        }else{// new comment form
            activeForm.classList.remove('disabled', 'was-validated')
            activeForm[0].disabled = false
            activeForm.reset()
        }
        alertComment(data, activeForm)
    })
}

function alertComment(data, activeForm){
    activeForm.querySelector('.top-alert-type').classList = `alert top-alert-type alert-${data.messageType}`
    activeForm.querySelector('.top-alert-title').innerText = data.messageTitle
    activeForm.querySelector('.top-alert-body').innerHTML = `<li>${data.messageBody}</li>`
    activeForm.querySelector('.top-alert').classList.add('open')
}


document.addEventListener('DOMContentLoaded', countComments())