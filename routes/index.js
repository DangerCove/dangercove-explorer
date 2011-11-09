/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Danger Cove Explorer', hostname: res.app.settings.hostname, port: res.app.settings.port })
};
