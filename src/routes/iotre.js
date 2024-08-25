import express from 'express';

import { get as getLandingPage } from '../controllers/common/core/landingPage.js'
import { get as getAPI }         from '../controllers/common/core/api.js'
import { get as getConformance } from '../controllers/common/core/conformance.js'
import { get as getCollections } from '../controllers/common/collections/collections.js'
import { get as getProvider } from '../controllers/common/collections/provider.js'
import { post as registerThing } from '../controllers/register.js'
import { post as AddObservations } from '../controllers/observations.js'

const router = express.Router();

router.get('/', getLandingPage)
router.get('/conformance', getConformance)
router.get('/api.:ext?', getAPI)
router.get('/collections', getCollections)
router.get('/collections/:providerId', getProvider)

router.post('/register', registerThing)
router.post('/observations', AddObservations)

export default router