/**
 * FoodCare City
 * Author: FoodCare Inc. Copyright 2013. All Rights Reserved
 */
// Augmented filesystem


Ti.Filesystem.file_get_contents = function(path, name) {
    var f = Ti.Filesystem.getFile(path, name);
    contents = f.read();
    f = null; // force derefence, allowing garbage collection
  if (contents) {
    return contents.text;
  } else {
    return '';
    }
}

exports.filesystem = Ti.Filesystem;
  
