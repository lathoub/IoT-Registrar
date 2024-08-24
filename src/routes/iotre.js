import express from 'express';

import { get as getLandingPage } from '../controllers/landingPage.js'
import { post as registerThing } from '../controllers/register.js'

const router = express.Router();

router.get('/', getLandingPage)
router.post('/register', registerThing)

  
export default router