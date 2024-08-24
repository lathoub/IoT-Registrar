import express from 'express';

import { get as getLandingPage } from '../controllers/landingPage.js'
import { get as getAPI }         from '../controllers/api.js'
import { get as getConformance } from '../controllers/conformance.js'
import { get as getCollections } from '../controllers/collections.js'
import { post as registerThing } from '../controllers/register.js'

const router = express.Router();

router.get('/', getLandingPage)
router.get('/conformance', getConformance)
router.get('/api.:ext?', getAPI)
router.get('/collections', getCollections)

router.post('/register', registerThing)

export default router