'use strict';

exports = module.exports = function(app, mongoose) {
  var ludiGroupSchema = new mongoose.Schema({
    users: [{
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: { type: String, default: '' }
    }],
    category: [{
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'LudiCategory' },
      name: { type: String, default: '' }
    }],
    name: { type: String, default: '' },
    timeCreated: { type: Date, default: Date.now },
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date },
    search: [String]
  });
  ludiGroupSchema.plugin(require('./plugins/pagedFind'));
  ludiGroupSchema.index({ user: 1 });
  ludiGroupSchema.index({ search: 1 });
  ludiGroupSchema.set('autoIndex', (app.get('env') === 'development'));
  app.db.model('LudiGroup', ludiGroupSchema);
};