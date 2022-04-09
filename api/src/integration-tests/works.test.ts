import chai, { expect } from 'chai'
import chaiHttp from 'chai-http'
import { Db, MongoClient } from 'mongodb'

import { app } from '../app'
import work1 from './data/work1.json'
import work2 from './data/work2.json'
import invalidTitleWork from './data/invalidTitleWork.json'
import invalidSupervisorWork from './data/invalidSupervisorWork.json'
import invalidStudent1Work from './data/invalidStudent1Work.json'
import invalidStudent2Work from './data/invalidStudent2Work.json'
import invalidStudent3Work from './data/invalidStudent3Work.json'
import invalidAreaWork1 from './data/invalidAreaWork1.json'
import invalidAreaWork2 from './data/invalidAreaWork2.json'
import invalidCoSupervisorWork from './data/invalidCoSupervisorWork.json'
import works from './data/works.json'

const should = chai.should()

chai.use(chaiHttp)

const DB_NAME = 'feciapp2022'
const MONGODB_URL = `mongodb://localhost:27017/${DB_NAME}`

describe('Works integration tests', () => {
  let connection: MongoClient = null
  let db: Db = null

  before(async () => {
    connection = await MongoClient.connect(MONGODB_URL)
    db = connection.db(DB_NAME)
  })

  beforeEach(async () => {
    await db.collection('evaluators').deleteMany({})
  })

  it('should save a work with valid mandatory properties', (done) => {
    chai
      .request(app)
      .post('/works')
      .send(work1)
      .end((err, res) => {
        res.should.have.status(201)
        const { work } = res.body
        expect(work._id).to.be.not.null
        done()
      })
  })

  it('should save a work with valid full properties', (done) => {
    chai
      .request(app)
      .post('/works')
      .send(work2)
      .end((err, res) => {
        res.should.have.status(201)
        const { work } = res.body
        expect(work._id).to.be.not.null
        done()
      })
  })

  it('should not save a work with invalid title', (done) => {
    chai
      .request(app)
      .post('/works')
      .send(invalidTitleWork)
      .end((err, res) => {
        res.should.have.status(400)
        const { message } = res.body
        expect(message).to.equal('Invalid title')
        done()
      })
  })

  it('should not save a work with invalid supervisor name', (done) => {
    chai
      .request(app)
      .post('/works')
      .send(invalidSupervisorWork)
      .end((err, res) => {
        res.should.have.status(400)
        const { message } = res.body
        expect(message).to.equal('Invalid supervisor name')
        done()
      })
  })

  it('should not save a work with invalid first student name', (done) => {
    chai
      .request(app)
      .post('/works')
      .send(invalidStudent1Work)
      .end((err, res) => {
        res.should.have.status(400)
        const { message } = res.body
        expect(message).to.equal('Invalid first student name')
        done()
      })
  })

  it('should not save a work with invalid second student name', (done) => {
    chai
      .request(app)
      .post('/works')
      .send(invalidStudent2Work)
      .end((err, res) => {
        res.should.have.status(400)
        const { message } = res.body
        expect(message).to.equal('Invalid second student name')
        done()
      })
  })

  it('should not save a work with invalid third student name', (done) => {
    chai
      .request(app)
      .post('/works')
      .send(invalidStudent3Work)
      .end((err, res) => {
        res.should.have.status(400)
        const { message } = res.body
        expect(message).to.equal('Invalid third student name')
        done()
      })
  })

  it('should not save a work with no area informed', (done) => {
    chai
      .request(app)
      .post('/works')
      .send(invalidAreaWork1)
      .end((err, res) => {
        res.should.have.status(400)
        const { message } = res.body
        expect(message).to.equal('No area informed')
        done()
      })
  })

  it('should not save a work with an invalid area', (done) => {
    chai
      .request(app)
      .post('/works')
      .send(invalidAreaWork2)
      .end((err, res) => {
        res.should.have.status(400)
        const { message } = res.body
        expect(message).to.equal('Invalid area')
        done()
      })
  })

  it('should not save a work with an invalid co-supervisor name', (done) => {
    chai
      .request(app)
      .post('/works')
      .send(invalidCoSupervisorWork)
      .end((err, res) => {
        res.should.have.status(400)
        const { message } = res.body
        expect(message).to.equal('Invalid co-supervisor name')
        done()
      })
  })

  it('should return all works from a given valid area', (done) => {
    Object.keys(works).forEach(async (key) => {
      const work = works[key]
      await chai.request(app).post('/works').send(work)
    })

    let correctAmount = 0
    const area = 'CET'
    works.forEach((w) => {
      if (w.area == area) {
        correctAmount++
      }
    })

    chai
      .request(app)
      .get(`/works/${area}`)
      .end((err, res) => {
        res.should.have.status(200)
        const { works } = res.body
        expect(works.length).to.equal(correctAmount)
        done()
      })
  })

  it('should not return any work when given an invalid area', (done) => {
    chai
      .request(app)
      .get('/works/Exatas')
      .end((err, res) => {
        res.should.have.status(400)
        const { message, works } = res.body
        expect(message).to.equal('Invalid area')
        expect(works).to.equal(null)
        done()
      })
  })

  it('should return a work when given its correct id', (done) => {
    chai
      .request(app)
      .post('/works')
      .send(work1)
      .end((err, res) => {
        const { work } = res.body
        chai
          .request(app)
          .get(`/works/single/${work._id}`)
          .end((err, res) => {
            res.should.have.status(200)
            const { work } = res.body
            expect(work1.title).to.equal(work.title)
            done()
          })
      })
  })

  it('should not return a work when given an invalid id', (done) => {
    chai
      .request(app)
      .get('/works/single/1')
      .end((err, res) => {
        res.should.have.status(400)
        const { message } = res.body
        expect(message).to.equal('Invalid id')
        done()
      })
  })

  it('should return status 404 and correct error message when given an id that does not match any work', (done) => {
    chai
      .request(app)
      .get('/works/single/5df2e7c7257aa3074a174842')
      .end((err, res) => {
        res.should.have.status(404)
        const { message } = res.body
        expect(message).to.equal('Work not found')
        done()
      })
  })
})
