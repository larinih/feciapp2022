import { connect } from 'mongoose'

export const connectToMongoDB = async () => {
  await connect('mongodb://localhost/feciapp2022')
  console.log('App connected to MongoDB')
}
