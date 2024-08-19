const modelsInterface = {
    user: {
        displayName: "Users",
        displayFields: [
            {key: "userName", header: "User Name", type: "String"},
            {key: "createDate", header: "Create Date", type: "DateTime"},
            {key: "email", header: "Email", type: "String"},
            {key: "emailVerified", header: "Verified", type: "Boolean", linkRelation: "user", filter: "verified", filterKey: "emailVerified"},
            {key: "posts", header: "Posts", type: "Int", linkRelation: "user", filter: "author", filterKey: 'id'},
            {key: "comments", header: "Comments", type: "Int", linkRelation: "comment", filter: "author", filterKey: 'id'},
            {key: "role", header: "Role", type: "String", linkRelation: "user", filter: "role", filterKey: "roleId", sortRelation: "role", sortKey: "name"},
        ],
        selectFields : {
            id: true,
            userName: true,
            createDate: true,
            email: true,
            emailVerified: true,
            _count: {
                select: { 
                    posts: true,
                    comments: true
                }
            },
            role: {
                select: {
                    id: true,
                    name: true
                }
            }
        },
        destructur: (user) => ({
            ...user,
            posts: user._count.posts,
            comments: user._count.comments,
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

    post: {
        displayName: "Posts",
        displayFields: [
            {key: "title", header: "Title", type: "String"},
            {key: "createDate", header: "Create Date", type: "DateTime"},
            {key: "updated", header: "Update Date", type: "DateTime"},
            {key: "slug", header: "Slug", type: "String"},
            {key: "publish", header: "Published", type: "Boolean"},
            {key: "viewCount", header: "Views", type: "Int"},
            {key: "author", header: "Author", type: "String", linkRelation: "post", filter: "author", filterKey: 'authorId', sortRelation: "author", sortKey: 'userName'},
            {key: "comments", header: "Comments", type: "Int", linkRelation: "comment", filter: "post", filterKey: 'id'}
        ],
        selectFields: {
            id: true,
            metatitle: true,
            metadescription: true,
            createDate: true,
            updated: true,
            title: true,
            body: true,
            slug: true,
            publish: true,
            viewCount: true,
            author: {
                select: {
                    userName: true
                }
            },
            authorId: true,
            _count:{
                select: {
                    comments: true
                }
            }
        },
        destructur: (post) => ({
            ...post,
            author: post.author.userName,
            comments: post._count.comments,
            _count: undefined
        }),
        filters: [
            {name: "id", key: "id", type: "ObjectID"}, // filter posts by Id
            {name: "author", key: "authorId", type: "ObjectID"} // filter posts by author
        ]
    },
      
    comment: {
        displayName: "Comments",
        displayFields: [
            {key: "comment", header: "Comment", type: "String"},
            {key: "createdAt", header: "Create Date", type: "DateTime"},
            {key: "publish", header: "Published", type: "Boolean"},
            {key: "author", header: "Author", type: "String", linkRelation: "user", filter: "id", filterKey: "authorId", sortRelation: "user", sortKey: 'userName'},
            {key: "post", header: "Post", type: "String", linkRelation: "post", filter: "id", filterKey: "postId", sortRelation: "post", sortKey: 'title' },
            {key: "replies", header: "Replies", type: "Int", linkRelation: "comment", filter: "parent", filterKey: "id" }
        ],
        selectFields: {
            id: true,
            createdAt: true,
            comment: true,
            publish: true,
            author: {
                select: {
                    userName: true
                }
            },
            authorId: true,
            post: {
                select:{
                    id: true,
                    title: true
                }
            },
            postId: true,
            _count:{
                select: {
                    replies: true
                }
            }
        },
        destructur: (comment) => ({
            ...comment,
            author: comment.author.userName,
            replies: comment._count.replies,
            post: comment.post.title,
            _count: undefined
        }),
        filters: [
            {name: "parent", key: "parentId", type: "ObjectID"}, 
        ],
        orderBy: {
            datedesc: {createdAt: 'desc'},
            dateasc: {createdAt: 'asc'}
        }
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