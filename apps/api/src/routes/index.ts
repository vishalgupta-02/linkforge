// src/routes/index.ts

import { Router } from 'express'
import v1Routes from './v1/index.ts'
// import v2Routes from './v2/index.ts'

const router: Router = Router()

router.use('/v1', v1Routes)
// router.use('/v2', v2Routes)

export default router
