// top level route
const express = require('express')
const router = express.Router()
const { ensureAuth, ensureGuest } = require('../middleware/auth')

const Story = require('../models/Story.js')

// @desc: Login/Landing page
// @route: GET /
router.get('/', ensureGuest, (req, res) => {
  res.render('login', {
    layout: 'login'
  })
})

// @desc: dashboard
// @route: GET /dashboard
router.get('/dashboard', ensureAuth, async (req, res) => {
  try {
    const stories = await Story.find({ user: req.user.id }).lean()  // plain JS objects,
    // not mongoose documents, so that we can use it in templates like HBS
    res.render('dashboard', {
      name: req.user.firstName,
      stories
    })
  } catch(err) {
    console.error(err)
    res.render('error/500')
  }
})

module.exports = router
