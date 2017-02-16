'use strict';

exports = module.exports = function(app, mongoose) {
  var postSchema = new mongoose.Schema({
    user: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: { type: String, default: '' }
    },
    group: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'LudiGroup' }
    },
    story: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'Story' }
    },
    content: {
      mediaType: { type: String, default: '' },
      fileLocation: { type: String, default: '' }
    },
    votes: [{
        time: { type: Date, default: Date.now },
        id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }],
    timeCreated: { type: Date, default: Date.now },
    search: [String]
  });
  postSchema.plugin(require('./plugins/pagedFind'));
  postSchema.index({ user: 1 });
  postSchema.index({ search: 1 });
  postSchema.set('autoIndex', (app.get('env') === 'development'));
  app.db.model('Post', postSchema);
};