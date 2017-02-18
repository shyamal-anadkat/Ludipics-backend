'use strict';

var post = {
	find: function (req, res, next) {
		// Double check this
	    req.query.user = req.query.user ? req.query.user : '';
	    req.query.group = req.query.group ? req.query.group : '';
	    req.query.story = req.query.story ? req.query.story : '';
	    req.query.limit = req.query.limit ? parseInt(req.query.limit, null) : 20;
	    req.query.page = req.query.page ? parseInt(req.query.page, null) : 1;
	    req.query.sort = req.query.sort ? req.query.sort : '_id';

	    var filters = {};
	    if (req.query.user.id) {
	      filters.user.id = new RegExp('^.*?' + req.query.user.id + '.*$', 'i');
	    }
	    if (req.query.group.id) {
	      filters.group.id = new RegExp('^.*?' + req.query.group.id + '.*$', 'i');
	    }
	    if (req.query.story.id) {
	      filters.story.id = new RegExp('^.*?' + req.query.story.id + '.*$', 'i');
	    }

	    req.app.db.models.Post.pagedFind({
	      filters: filters,
	      keys: 'user.id group.id story.id',
	      limit: req.query.limit,
	      page: req.query.page,
	      sort: req.query.sort
	    }, function (err, results) {
	      if (err) {
	        return next(err);
	      }

	      results.filters = req.query;
	      res.status(200).json(results);
	    });
  	},
	create: function (req, res, next) {
	    var workflow = req.app.utility.workflow(req, res);
	    workflow.on('validate', function () {
	      	if (!req.body.story || !req.body.story.id) {
	        	workflow.outcome.errors.push('A story is required.');
	        	return workflow.emit('response');
	      	}
	      	if (!req.body.group || !req.body.group.id) {
	        	workflow.outcome.errors.push('A group is required.');
	        	return workflow.emit('response');
	      	}
	      	if (!req.body.img || !req.body.img.data) {
	        	workflow.outcome.errors.push('Must upload an image');
	        	return workflow.emit('response');
	      	}

	      workflow.emit('createPost');
	    });

	    workflow.on('createPost', function () {
	      var fieldsToSet = {
	        group: req.body.group,
	        story: req.body.story,
	        user: {
	        	_id: req.user.id,
	        	name: req.user.name
	        },
	        // TODO Figure out how this actually works and also Videos
	        img: {
	        	data: fs.readFileSync(req.imgPath),
	        	contentType: 'image/png'
	        }
	      };

	      req.app.db.models.Post.create(fieldsToSet, function (err, post) {
	        if (err) {
	          return workflow.emit('exception', err);
	        }

	        workflow.outcome.record = post;
	        return workflow.emit('response');
	      });
	    });

    	workflow.emit('validate');
  	},
  	read: function (req, res, next) {
	    req.app.db.models.Post.findById(req.params.id).exec(function (err, post) {
	      if (err) {
	        return next(err);
	      }
	      res.status(200).json(post);
	    });
	},
  	delete: function (req, res, next) {
	    var workflow = req.app.utility.workflow(req, res);

	    workflow.on('deletePost', function (err) {
	      req.app.db.models.Post.findByIdAndRemove(req.params.id, function (err, post) {
	        if (err) {
	          return workflow.emit('exception', err);
	        }
	        workflow.emit('response');
	      });
	    });

	    workflow.emit('deletePost');
	},
};
module.exports = post;