'use strict';

exports = module.exports = function(app, mongoose) {
  var ludiCategorySchema = new mongoose.Schema({
    name: { type: String, default: '' },
    description: { type: String, default: '' },
    pivot: { type: String, default: '' },
    image: {
      fileLocation: { type: String, default: '' }
    }
  });
  ludiCategorySchema.plugin(require('./plugins/pagedFind'));
  ludiCategorySchema.index({ pivot: 1 });
  ludiCategorySchema.index({ name: 1 });
  ludiCategorySchema.set('autoIndex', (app.get('env') === 'development'));
  app.db.model('LudiCategory', ludiCategorySchema);
};