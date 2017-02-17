'use strict';

exports = module.exports = function(app, mongoose) {
  var dailySchema = new mongoose.Schema({
    date: {type: Date },
    categories: [
      {
        id: { type: mongoose.Schema.Types.ObjectId, ref: 'LudiCategory' },
        name: { type: String, default: '' },
        highlights: [
          {
            id: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
          }
        ]
      }
    ],
    name: { type: String, default: '' }
  });
  dailySchema.plugin(require('./plugins/pagedFind'));
  dailySchema.index({ pivot: 1 });
  dailySchema.index({ name: 1 });
  dailySchema.set('autoIndex', (app.get('env') === 'development'));
  app.db.model('Daily', dailySchema);
};
