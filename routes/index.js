const Pet = require('../models/pet');

module.exports = (app) => {

  /* GET home page. */
  app.get('/', (req, res) => {
    const page = req.query.page || 1
    Pet.paginate({}, { page: page })
      .then((results) => {
        if (req.header('Content-Type') == 'application/json') {
          return res.json({
            pets: results.docs,
            currentPage: results.page,
            pagesCount: results.pages
          });
        } else {
          res.render('pets-index', {
            pets: results.docs,
            currentPage: results.page,
            pagesCount: results.pages
          });
        }
      });
  });
}
