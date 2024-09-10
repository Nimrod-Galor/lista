import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient().$extends({
  result: {
    user: {
      createDate: {
        needs: { createdAt: true },
        compute(user) {
          return new Date(user.createdAt).toLocaleString()
        }
      }
    },
    list: {
      createDate: {
        needs: { createdAt: true },
        compute(list) {
          return new Date(list.createdAt).toLocaleString()
        }
      },
      updated: {
        needs: { updatedAt: true },
        compute(list) {
          return new Date(list.updatedAt).toLocaleString()
        }
      }
    },
    invite: {
      createDate: {
        needs: { createdAt: true },
        compute(user) {
          return new Date(user.createdAt).toLocaleString()
        }
      }
    }
  }
})

/*  Create */
export function createRow(collectionName, data){
  return prisma[collectionName].create({data})
}

/*  Read multiple rows */
export function readRows(collectionName, data = '') {
  return prisma[collectionName].findMany(data)
}

/*  Read single row */
export function readRow(collectionName, data = '') {
  return prisma[collectionName].findFirstOrThrow(data)
}

/*  Update  */
export function updateRow(collectionName, where, data){
  return prisma[collectionName].update({
    where,
    data
  })
}

/*  Delet single  */
export function deleteRow(collectionName, where){
  return prisma[collectionName].delete({
    where
  })
}

/*  Delete Many */
export function deleteRows(collectionName, where){
  return prisma[collectionName].deleteMany({
    where
  })
}

/*  Count Rows */
export function countRows(collectionName, where){
  return prisma[collectionName].count({ where })
}

/*  Count Multiple Rows*/
export function countsRows(collectionsName, where){
  let parr = []
  for(let i=0; i<collectionsName.length; i++){
    parr.push(prisma[collectionsName[i]].count({ where: where[i] }))
  }
  return Promise.all(parr)
}

/*  Find Unique */
export function findUnique(collectionName, where, select){
  const obj = { where }
  if(select){
    obj.select = select
  }
  return prisma[collectionName].findUnique(obj)
}
