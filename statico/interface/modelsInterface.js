const modelsInterface = {
    user: {
        displayName: "Users",
        displayFields: [
            {key: "userName", header: "User Name", type: "String"},
            {key: "createDate", header: "Create Date", type: "DateTime"},
            {key: "email", header: "Email", type: "String"},
            {key: "emailVerified", header: "Verified", type: "Boolean", linkRelation: "user", filter: "verified", filterKey: "emailVerified"},
            // {key: "posts", header: "Posts", type: "Int", linkRelation: "user", filter: "author", filterKey: 'id'},
            // {key: "comments", header: "Comments", type: "Int", linkRelation: "comment", filter: "author", filterKey: 'id'},
            {key: "role", header: "Role", type: "String", linkRelation: "user", filter: "role", filterKey: "roleId", sortRelation: "role", sortKey: "name"},
        ],
        selectFields : {
            id: true,
            userName: true,
            createDate: true,
            email: true,
            emailVerified: true,
            // _count: {
            //     select: { 
            //         posts: true,
            //         comments: true
            //     }
            // },
            role: {
                select: {
                    id: true,
                    name: true
                }
            }
        },
        destructur: (user) => ({
            ...user,
            // posts: user._count.posts,
            // comments: user._count.comments,
            role: user.role.name,
            roleId: user.role.id,
            _count: undefined // optionally remove the original _count field
        }),
        filters: [
            {name: "username", key: "userName", type: "userName"}, // by user name 
            {name: "id", key: "id", type: "ObjectID"}, // by id
            {name: "verified", key: "emailVerified", type: "BooleanString"}, // filter users by emailVerified
            {name: "role", key: "roleId", type: "ObjectID"}
        ]
    },
      
    page: {
        displayName: "Pages",
        displayFields: [
            {key: "title", header: "Title", type: "String"},
            {key: "slug", header: "Slug", type: "String"},
            {key: "publish", header: "Published", type: "Boolean"},
        ],
        selectFields: {
            id: true,
            metatitle: true,
            metadescription: true,
            title: true,
            body: true,
            slug: true,
            publish: true
        },
        filters: [
            {name: "published", key: "publish", type: "Boolean"} // filter pages by publish
        ]
    },

    list: {
        displayName: "Lists",
        displayFields: [
            {key: "title", header: "Title", type: "String", linkRelation: "list" , filterKey: 'id'},
            {key: "createDate", header: "Create Date", type: "DateTime"},
            {key: "updated", header: "Update Date", type: "DateTime"},
            {key: "publish", header: "Public", type: "Boolean"},
            {key: "viewCount", header: "Views", type: "Int"},
            {key: "author", header: "Author", type: "String", linkRelation: "post", filter: "author", filterKey: 'authorId', sortRelation: "author", sortKey: 'userName'},
        ],
        selectFields: {
            id: true,
            dir: true,
            createDate: true,
            updated: true,
            title: true,
            description: true,
            body: true,
            publish: true,
            viewCount: true,
            viewersIDs: true,
            author: {
                select: {
                    userName: true
                }
            },
            authorId: true,
            viewers: {
                select : {
                    id: true,
                    userName: true,
                    email: true
                }
            },
            editors: true,
            _count:{
                select: {
                    viewers: true,
                    editors: true
                }
            },
            pendingInvites: {
                select: {
                    id: true,
                    listId: true,
                    recipient: {
                        select: {
                            email: true
                        }
                    }
                }
            }
        },
        destructur: (item) => ({
            ...item,
            author: item.author.userName,
            viewersCount: item._count.viewers,
            editorsCount: item._count.editors,
            _count: undefined
        }),
        filters: [
            {name: "id", key: "id", type: "ObjectID"}, // filter posts by Id
            {name: "author", key: "authorId", type: "ObjectID"} // filter posts by author
        ]
    },

    invite: {
        displayName: "Invites",
        displayFields: [
            {key: "createDate", header: "Create Date", type: "DateTime"},
            {key: "author", header: "Author", type: "String", linkRelation: "user", filter: "id", filterKey: 'id', sortRelation: "userName", sortKey: 'userName'},
            {key: "recipient", header: "Recipient", type: "String", linkRelation: "user", filter: "id", filterKey: 'id', sortRelation: "userName", sortKey: 'userName'},
            {key: "listId", header: "List Id", type: "String", linkRelation: "list", filter: "id", filterKey: "listId"}
        ],
        selectFields: {
            id: true,
            createdAt: true,
            author: {
                select: {
                    userName: true
                }
            },
            authorId: true,
            recipient: {
                select: {
                    userName: true
                }
            },
            recipientEmail: true,
            listId: true
        },
        destructur: (item) => ({
            ...item,
            author: item.author.userName,
            recipient: item.recipient.userName,
        })
    },
    
    role: {
        displayName: "Roles",
        displayFields: [
            {key: "name", header: "Name", type: "String"},
            {key: "description", header: "Description", type: "String"}
        ],
        selectFields: {
            id: true,
            name: true,
            description: true
        }
    }
}

export default modelsInterface