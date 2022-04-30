import chai, { expect } from 'chai'
import chaiHttp from 'chai-http'
import { Db, MongoClient } from 'mongodb'

import { app } from '../app'
import evaluator from './data/evaluator.json'
import invalidNameEvaluator from './data/invalidNameEvaluator.json'
import invalidEmailEvaluator1 from './data/invalidEmailEvaluator1.json'
import invalidEmailEvaluator2 from './data/invalidEmailEvaluator2.json'
import invalidAreasEvaluator1 from './data/invalidAreasEvaluator1.json'
import invalidAreasEvaluator2 from './data/invalidAreasEvaluator2.json'
import invalidPasswordEvaluator1 from './data/invalidPasswordEvaluator1.json'
import evaluators from './data/evaluators.json'

const should = chai.should()

chai.use(chaiHttp)

const DB_NAME = 'feciapp2022'
const MONGODB_URL = `mongodb://localhost:27017/${DB_NAME}`

describe('Evaluators integration tests', () => {
  let connection: MongoClient = null
  let db: Db = null

  before(async () => {
    connection = await MongoClient.connect(MONGODB_URL)
    db = connection.db(DB_NAME)
  })

  beforeEach(async () => {
    await db.collection('evaluators').deleteMany({})
  })

  it('should save a valid evaluator', (done) => {
    chai
      .request(app)
      .post('/evaluators')
      .send(evaluator)
      .end((err, res) => {
        res.should.have.status(201)
        const { evaluator } = res.body
        expect(evaluator._id).to.not.be.null
        done()
      })
  })

  it('should not save an evaluator with an invalid name', (done) => {
    chai
      .request(app)
      .post('/evaluators')
      .send(invalidNameEvaluator)
      .end((err, res) => {
        res.should.have.status(400)
        const { message } = res.body
        expect(message).to.equal('Invalid name')
        done()
      })
  })

  it('should not save an evaluator with no given e-mail', (done) => {
    chai
      .request(app)
      .post('/evaluators')
      .send(invalidEmailEvaluator1)
      .end((err, res) => {
        res.should.have.status(400)
        const { message } = res.body
        expect(message).to.equal('Invalid e-mail')
        done()
      })
  })

  it('should not save an evaluator with an invalid e-mail', (done) => {
    chai
      .request(app)
      .post('/evaluators')
      .send(invalidEmailEvaluator2)
      .end((err, res) => {
        res.should.have.status(400)
        const { message } = res.body
        expect(message).to.equal('Invalid e-mail')
        done()
      })
  })

  it('should not save an evaluator with no given areas', (done) => {
    chai
      .request(app)
      .post('/evaluators')
      .send(invalidAreasEvaluator1)
      .end((err, res) => {
        res.should.have.status(400)
        const { message } = res.body
        expect(message).to.equal('Areas not informed')
        done()
      })
  })

  it('should not save an evaluator with invalid areas', (done) => {
    chai
      .request(app)
      .post('/evaluators')
      .send(invalidAreasEvaluator2)
      .end((err, res) => {
        res.should.have.status(400)
        const { message } = res.body
        expect(message).to.equal('Invalid areas')
        done()
      })
  })

  it('should not save an evaluator with no given password', (done) => {
    chai
      .request(app)
      .post('/evaluators')
      .send(invalidPasswordEvaluator1)
      .end((err, res) => {
        res.should.have.status(400)
        const { message } = res.body
        expect(message).to.equal('Password missing')
        done()
      })
  })

  it('should not save an evaluator with an invalid password', (done) => {
    chai
      .request(app)
      .post('/evaluators')
      .send(invalidPasswordEvaluator1)
      .end((err, res) => {
        res.should.have.status(400)
        const { message } = res.body
        expect(message).to.equal(
          'Invalid password. Password must have 8 characters at least.'
        )
        done()
      })
  })

  it('should return all evaluators from a given valid area', (done) => {
    Object.keys(evaluators).forEach(async (key) => {
      const evaluator = evaluators[key]
      await chai.request(app).post('/evaluators').send(evaluator)
    })

    const area = 'CAE'
    let correctAmount = 0
    evaluators.forEach((e) => {
      if (e.areas.includes(area)) {
        correctAmount++
      }
    })

    chai
      .request(app)
      .get(`/evaluators/${area}`)
      .end((err, res) => {
        res.should.have.status(200)
        const { evaluators } = res.body
        expect(evaluators.length).to.equal(correctAmount)
        done()
      })
  })

  it('should not return any evaluator when given area is invalid', (done) => {
    chai
      .request(app)
      .get('/evaluators/Exatas')
      .end((err, res) => {
        res.should.have.status(400)
        const { message, evaluators } = res.body
        expect(message).to.equal('Invalid area')
        expect(evaluators).to.equal(null)
        done()
      })
  })

  it('should return an evaluator when given his previously registered e-mail', (done) => {
    chai
      .request(app)
      .post('/evaluators')
      .send(evaluator)
      .end((err, res) => {
        chai
          .request(app)
          .get(`/evaluators/single/${evaluator.email}`)
          .end((err, res) => {
            res.should.have.status(200)
            const { evaluator } = res.body
            expect(evaluator._id).to.not.be.null
            done()
          })
      })
  })

  it('should not return an evaluator when given an invalid e-mail', (done) => {
    chai
      .request(app)
      .get(`/evaluators/single/avaliador.email.com`)
      .end((err, res) => {
        res.should.have.status(400)
        const { message } = res.body
        expect(message).to.equal('Invalid e-mail')
        done()
      })
  })

  it('should return status 404 and correct error message when given an e-mail that does not match any evaluator', (done) => {
    chai
      .request(app)
      .get(`/evaluators/single/avaliador.email.com`)
      .end((err, res) => {
        res.should.have.status(404)
        const { message } = res.body
        expect(message).to.equal('Evaluator not found')
        done()
      })
  })
})
