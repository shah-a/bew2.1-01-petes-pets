// MODELS
const Pet = require('../models/pet');

// UPLOADING TO AWS S3
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const Upload = require('s3-uploader');

// SENDING EMAILS VIA MAILGUN
const mailer = require('../utils/mailer');
const pet = require('../models/pet');

const client = new Upload(process.env.S3_BUCKET, {
  aws: {
    path: 'pets/avatar',
    region: process.env.S3_REGION,
    acl: 'public-read',
    accessKeyId: process.env.AWS_ID,
    secretAccessKey: process.env.AWS_SECRET
  },
  cleanup: {
    versions: true,
    original: true
  },
  versions: [{
    maxWidth: 400,
    aspect: '16:10',
    suffix: '-standard'
  }, {
    maxWidth: 300,
    aspect: '1:1',
    suffix: '-square'
  }]
});

// PET ROUTES
module.exports = (app) => {

  // INDEX PET => index.js

  // NEW PET
  app.get('/pets/new', (req, res) => {
    res.render('pets-new');
  });

  // CREATE PET
  app.post('/pets', upload.single('avatar'), (req, res) => {
    const pet = new Pet(req.body);
    if (req.file) {
      client.upload(req.file.path, {}, function (err, versions, meta) {
        if (err) { console.log(err); return res.status(400).send({ err: err }); }

        // versions[0] and versions[1] are the same URL, except for "standard"
        // and "square" at the end of each, which would be popped off below anyway
        const urlArray = versions[0].url.split('-');
        urlArray.pop();
        const url = urlArray.join('-');
        pet.avatarUrl = url;

        pet.save();
        res.send({ pet: pet });
      });
    } else {
      res.send({ pet: pet });
    }
  });

  // SHOW PET
  app.get('/pets/:id', (req, res) => {
    Pet.findById(req.params.id).exec((err, pet) => {
      res.render('pets-show', { pet: pet });
    });
  });

  // EDIT PET
  app.get('/pets/:id/edit', (req, res) => {
    Pet.findById(req.params.id).exec((err, pet) => {
      res.render('pets-edit', { pet: pet });
    });
  });

  // OLD SEARCH PET, with proper pagination
  // app.get('/search', (req, res) => {
  //   const term = new RegExp(req.query.term, 'i');
  //   const page = req.query.page || 1
  //   Pet.paginate({
  //     $or: [
  //       { 'name': term },
  //       { 'species': term }
  //     ]
  //   }, { page: page })
  //     .then((results) => {
  //       res.render('pets-index', {
  //         'pets': results.docs,
  //         'currentPage': results.page,
  //         'pagesCount': results.pages,
  //         'term': req.query.term
  //       });
  //     });
  // });

  // NEW SEARCH PET, broken pagination, but has full text search
  app.get('/search', (req, res) => {
    Pet
      .find(
        { $text: { $search: req.query.term } },
        { score: { $meta: 'textScore' } }
      )
      .sort({
        score: { $meta: 'textScore' }
      })
      // .limit(20) // <-- needs pagination to work properly
      .exec((err, pets) => {
        if (err) { return res.status(400).send({ err: err }); }
        if (req.header('Content-Type') == 'application/json') {
          return res.json({ pets: pets });
        } else {
          return res.render('pets-index', {
            'pets': pets,
            // 'currentPage': ???, <-- fill in to fix pagination
            // 'pagesCount': ???,  <-- fill in to fix pagination
            'term': req.query.term
          });
        }
      });
  });

  // UPDATE PET
  app.put('/pets/:id', (req, res) => {
    Pet.findByIdAndUpdate(req.params.id, req.body)
      .then((pet) => {
        res.redirect(`/pets/${pet._id}`)
      })
      .catch((err) => {
        // Handle Errors
      });
  });

  // DELETE PET
  app.delete('/pets/:id', (req, res) => {
    Pet.findByIdAndRemove(req.params.id).exec((err, pet) => {
      return res.redirect('/')
    });
  });

  // CREATE PET
  app.post('/pets/:id/purchase', async (req, res) => {
    const stripe = require('stripe')(process.env.STRIPE_SK);
    const token = req.body.stripeToken;
    const petId = req.body.petId || req.params.id;

    let pet;
    Pet.findById(petId)
      .then((query) => {
        pet = query;
        return stripe.charges.create({
          amount: pet.price * 100,
          currency: 'usd',
          description: `Purchased ${pet.name}, ${pet.species}`,
          source: token
        })
      })
      .then((charge) => {
        const user = {
          email: req.body.stripeEmail,
          amount: charge.amount / 100,
          petName: pet.name
        };
        return mailer.sendMail(user, req, res);
      })
      .catch((err) => {
        console.log('Error:', err);
        res.redirect(`/pets/${req.params.id}`);
      })
  });
}
