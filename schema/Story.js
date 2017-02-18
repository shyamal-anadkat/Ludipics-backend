'use strict';

exports = module.exports = function(app, mongoose) {
  var storySchema = new mongoose.Schema({
    user: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: { type: String, default: '' }
    },
    ludiGroup: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'LudiGroup' }
    },
    name: { type: String, default: '' },
    timeCreated: { type: Date, default: Date.now },
    search: [String]
  });
  storySchema.plugin(require('./plugins/pagedFind'));
  storySchema.index({ user: 1 });
  storySchema.index({ search: 1 });
  storySchema.set('autoIndex', (app.get('env') === 'development'));
  app.db.model('Story', storySchema);
};