'use strict';

exports = module.exports = function(app, mongoose) {
  var groupSchema = new mongoose.Schema({
    users: [{
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: { type: String, default: '' }
    }],
    category: [{
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
      name: { type: String, default: '' }
    }],
    name: { type: String, default: '' },
    timeCreated: { type: Date, default: Date.now },
    startTime: { type: Date },
    endTime: { type: Date },
    search: [String]
  });
  groupSchema.plugin(require('./plugins/pagedFind'));
  groupSchema.index({ user: 1 });
  groupSchema.index({ search: 1 });
  groupSchema.set('autoIndex', (app.get('env') === 'development'));
  app.db.model('group', groupSchema);
};